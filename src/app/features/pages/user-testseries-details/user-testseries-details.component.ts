import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { testSeriesValidationErrorMessage } from '../../../core/constants/validation.constant';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, finalize, of, Subject, Subscription, tap } from 'rxjs';
import { apiResponse, Category, CategoryList } from '../../../core/models/interface/categories.interface';
import { CategoriesService } from '../../../core/services/categories.service';

@Component({
  selector: 'app-user-testseries-details',
  standalone: true,
  imports: [CommonModule, TableComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './user-testseries-details.component.html',
  styleUrl: './user-testseries-details.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserTestseriesDetailsComponent implements OnInit  {
  public isCreateQuesToTest: boolean = false;
  public showColumns: any;
  public GeneratedQuestions: any;
  public questionForm!: FormGroup;
  public testSeriesDetails: any;
  // public testForm: any = {
  //   title: '',
  //   subTitle: '',
  //   keyWords: [] as string[],
  //   files: [] as File[],
  //   minimumPassingScore: null as number | null,
  //   topics: [] as string[],
  //   duration: '',
  //   language: '',
  //   categoryIds: [] as any[]
  // };
  public isEditTest: boolean = false
  public topicsInput = '';
  public categoryIdsInput = '';
  public keywordsInput = '';
  public generateQues: boolean = false;
  public totalQuestionCount !: number ;
  public totalQuestions !: number ;
  
  private subscriptions: Subscription[] = [];



  tableHeaders: any = [];

  tableData: any = [];

  actionsConfig = [
    {
      key: 'start',
      label: 'Start',
      class: 'btn btn-outline-primary',
      visible: true,
    }
  ];

  // JSON Data
  AccordionData: any = [];


  validationErrorMessage = {
    titleRequiredError: 'Title is required.',
    subTitleRequiredError: 'Subtitle is required.',
    keywordsRequiredError: 'Keywords are required.',
    minimumPassingScoreRequiredError: 'Minimum passing score is required.',
    durationRequiredError: 'Duration is required.',
    languageRequiredError: 'Language is required.',
    categoryIdsRequiredError: 'Category IDs are required.'
  };

  handleAction(event: { action: string; row: any }) {
    switch (event.action) {
      case 'start':
        this.onStart(event.row);
        break;
      

      default:
        console.error('Unknown action:', event.action);
    }
  }

 
  onStart(val: any) {
    // console.log(val)
    const payload = {
      userId: this.getUserId(),
      testSeriesId: this.getTestSeriesId(),
      testId: val.id
    }
    console.log(payload)
   

    this.loading = true; // Start loading
   

    this.testSeriesService
      .startTest(payload)
      .pipe(
        tap((response) => {
          console.log(' successfull:', response);
          this.testSeriesDetails =  response.response
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
         
          console.log('completed.');
          this.router.navigateByUrl(`dash/test/${val.id}/${this.getTestSeriesId()}`);
          //  this.router.navigateByUrl(`dash/test/${val.id}`);
          // this.router.navigate(['dash/test', val.id], { queryParams: { key1: 'value1', key2: 'value2' } });
        })
      )
      .subscribe();
  }
  

  ngOnInit(): void {
    const testSeriesId  = this.getTestSeriesId()
    this.getTestseries(testSeriesId)
    this.getTestsByTestSeries(testSeriesId)

    this.transformData();

  }

  getTestSeriesId() {
    return this.route.snapshot.params['id']
  }

  getUserId() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId
  }

  


  

  transformData() {
    const categoryWiseMcqs = this.AccordionData.reduce(
      (result: any[], mcq: any) => {
        // Check if the category already exists in the result array
        const categoryIndex = result.findIndex(
          (cat: any) => cat.categoryId === mcq.categoryId
        );

        if (categoryIndex > -1) {
          // If category exists, push the MCQ into the existing category's mcqs array
          result[categoryIndex].mcqs.push({
            id: mcq.id,
            question: mcq.question,
            a: mcq.a,
            b: mcq.b,
            c: mcq.c,
            d: mcq.d,
            complexity: mcq.complexity,
            description: mcq.description,
          });
        } else {
          // If category doesn't exist, create a new category entry
          result.push({
            categoryId: mcq.categoryId,
            categoryName: mcq.categoryName,
            mcqs: [
              {
                id: mcq.id,
                question: mcq.question,
                a: mcq.a,
                b: mcq.b,
                c: mcq.c,
                d: mcq.d,
                complexity: mcq.complexity,
                description: mcq.description,
              },
            ],
          });
        }

        return result;
      },
      []
    );

    // Ensure the order is the same as the original AccordionData
    // (No need to sort if you want to keep the original order from AccordionData)
    this.GeneratedQuestions = this.sortCategoriesAndMCQs(categoryWiseMcqs);

    console.log(this.GeneratedQuestions);
  }

  sortCategoriesAndMCQs(data: any[]): any[] {
    // Sort categories alphabetically by categoryName
    const sortedCategories = data.sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );

    // Sort MCQs based on complexity (easy < medium < hard)
    sortedCategories.forEach((category: any) => {
      category.mcqs = category.mcqs.sort((a: any, b: any) => {
        const complexityOrder = ['easy', 'medium', 'hard'];
        return (
          complexityOrder.indexOf(a.complexity) -
          complexityOrder.indexOf(b.complexity)
        );
      });
    });

    return sortedCategories;
  }

  public chips: string[] = [];
  public chipInput: string = '';



  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public categories: Category[] | null = []; // To hold categories

  public isCreateNewCategory: boolean = true;

  public AllMappedCat: CategoryList[] = [];

  // Options available in the dropdown
  // public options: string[] = ['Apple', 'Banana', 'Cherry', 'Date', 'Grape', 'Lemon', 'Mango'];
  public filteredOptions: Category[] | null = []; // Filtered options for search
  public searchQuery: string = ''; // Current search input value
  public searchCategory: string = '';
  public searchCatSubject: Subject<string> = new Subject<string>();

  public selectedOption: Category | null = null; // Holds the selected option
  public dropdownOpen: boolean = false; // Controls dropdown visibility
  public categoryForm!: FormGroup;

  public categoryAsyncCall: boolean = false;
  public genQuesAsyncCall: boolean = false;
  public createTestAsyncCall: boolean = false
  // public categorytobeMoved : any

  @ViewChild('content') content!: TemplateRef<any>; // Reference to the template
  @ViewChild('genQues') genQues!: TemplateRef<any>;
  private modalRef!: NgbModalRef;

  constructor(
    private elementRef: ElementRef,
    private categoriesService: CategoriesService,
    private testSeriesService: TestSeriesService,
    private modalService: NgbModal,
    private route : ActivatedRoute,
    private router : Router
  ) {
   
  }

  


  getTestseries(id: any) {


    this.loading = true; // Start loading
   

    this.testSeriesService
      .getTestSeriesById(id)
      .pipe(
        tap((response) => {
          console.log(' successfull:', response);
          this.testSeriesDetails =  response.response
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
         
          console.log('completed.');
        })
      )
      .subscribe();
  }


  
 


  getTestsByTestSeries(id: any) {


    this.loading = true; // Start loading
   

    this.testSeriesService
      .getTestByTestSeries(id)
      .pipe(
        tap((response) => {
          console.log('successfull:', response);
          this.tableData = response; // Assign the fetched data to the list
          this.showColumns  = this.generateTableHeaders(response.map(({ id,keywords,files,topics,categories,minimumPassingScore, ...rest }: any) => rest));
          this.tableHeaders = this.generateTableHeaders(response)
          console.log(this.tableHeaders)
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
         
          console.log('completed.');
        })
      )
      .subscribe();
  }

  generateTableHeaders(dataArray: any[]): { key: string; displayName: string, pipe: string | null, pipeFormat: string | null }[] {
    if (!dataArray || dataArray.length === 0) {
      return [];
    }
  
    const formatDisplayName = (key: string): string =>
      key
        .replace(/([A-Z])/g, ' $1') // Add a space before uppercase letters (camelCase to spaced)
        .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  
    return Object.keys(dataArray[0]).map((key) => {
      let pipe = null;
      let pipeFormat = null;
  
      // // Add 'currency' pipe for 'fee' column
      // if (key === 'fee') {
      //   pipe = 'currency';  // The pipe name for fee is currency
      //   pipeFormat = 'INR';  // No special formatting for 'currency' pipe
      // } 
      // // Add 'date' pipe for 'startDate' column
      // else if (key === 'startDate') {
      //   pipe = 'date';  // The pipe name for startDate is date
      //   pipeFormat = 'd MMM, y';  // Custom format for date (can be changed as needed)
      // }
  
      return {
        key: key,
        displayName: formatDisplayName(key),
        pipe: pipe,
        pipeFormat: pipeFormat
      };
    });
  }
  

 

  
}
