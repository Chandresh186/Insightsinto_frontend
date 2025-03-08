import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TableComponent } from '../../../../shared/resusable_components/table/table.component';
import { AsyncButtonComponent } from '../../../../shared/resusable_components/async-button/async-button.component';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime, tap, catchError, of, finalize, Subscription } from 'rxjs';
import { Category, CategoryList, apiResponse } from '../../../../core/models/interface/categories.interface';
import { CategoriesService } from '../../../../core/services/categories.service';
import { TestSeriesService } from '../../../../core/services/test-series.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';
import { TestSeriesTestMappingService } from '../../../../core/services/test-series-test-mapping.service';

@Component({
  selector: 'app-test-series-details',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    AsyncButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    ngbootstrapModule,
    RouterModule
  ],
  templateUrl: './test-series-details.component.html',
  styleUrl: './test-series-details.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TestSeriesDetailsComponent implements OnInit {
  public isCreateQuesToTest: boolean = false;
  public showColumns: any;
  public GeneratedQuestions: any;
  public questionForm!: FormGroup;
  public testSeriesDetails: any;
  // public testForm!: FormGroup;
  public testForm: any = {
    title: '',
    subTitle: '',
    keyWords: [] as string[],
    files: [] as File[],
    minimumPassingScore: '',
    topics: [] as string[],
    duration: '',
    language: '',
    categoryIds: [] as any[]
  };
  public isEditTest: boolean = false
  public topicsInput = '';
  public categoryIdsInput = '';
  public keywordsInput = '';
  public generateQues: boolean = false;
  public totalQuestionCount !: number ;
  public totalQuestions !: number ;
  
  private subscriptions: Subscription[] = [];

  public startTime: string = '';
  public endTime: string = '';



  tableHeaders: any = [
    // { key: 'id', displayName: 'ID' },
    // { key: 'name', displayName: 'Test Name' },
    // { key: 'date', displayName: 'Date' },
    // { key: 'duration', displayName: 'Duration' },
  ];

  tableData: any = [
    
  ];

  actionsConfig = [
    {
      key: 'edit',
      label: 'Edit',
      class: 'btn btn-outline-primary',
      visible: false,
    },
    {
      key: 'delete',
      label: 'Delete',
      class: 'btn btn-outline-danger',
      visible: true,
    },
    {
      key: 'details',
      label: 'Details',
      class: 'btn btn-outline-info',
      visible: false,
    },
  ];

  // JSON Data
  AccordionData: any = [
    
  ];


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
      case 'edit':
        this.onEdit(event.row);
        break;
      case 'delete':
        this.deleteTest(event.row);
        break;
      case 'details':
        this.onDetails(event.row);
        break;

      default:
        console.error('Unknown action:', event.action);
    }
  }

  onEdit(e: any) {
    this.isEditTest = true;
    this.testForm = {
      title: e.title,
      subTitle: e.subTitle,
      keyWords: e.keywords,
      files: [] as File[],
      minimumPassingScore: e.minimumPassingScore,
      topics: e.topics,
      duration: e.duration,
      language: e.language,
      categoryIds: e.categories
    }
    this.createTestModel()
  }

  onDetails(e: any) {
    this.isCreateQuesToTest = true;
    this.testForm = {
      title: e.title,
      subTitle: e.subTitle,
      keyWords: e.keywords,
      files: [] as File[],
      minimumPassingScore: e.minimumPassingScore,
      topics: e.topics,
      duration: e.duration,
      language: e.language,
      categoryIds: e.categories,
     
    }
    this.testForm.id =  e.id

    

    this.loading = true; // Start loading
   

    this.testSeriesService
      .getTestPaperById(e.id)
      .pipe(
        tap((response) => {
          this.AccordionData = response;
          this.transformData();
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
         
        })
      )
      .subscribe();




  }

  ngOnInit(): void {
    // this.showColumns = this.tableHeaders;
   
    // this.getAllMappedCategories();

    this.categoryForm = new FormGroup({
      id: new FormControl(''),
      catName: new FormControl(''), // You can set a default value here
      parentCatId: new FormControl(''),
    });

    this.questionForm = new FormGroup({
      id: new FormControl(''),
      selectedCategory: new FormControl('', Validators.required),
      easyQuestions: new FormControl('', [
        Validators.required,
        Validators.min(1),
      ]),
      mediumQuestions: new FormControl('', [
        Validators.required,
        Validators.min(1),
      ]),
      hardQuestions: new FormControl('', [
        Validators.required,
        Validators.min(1),
      ]),
    });



      


   

    const testSeriesId  = this.getTestSeriesId()
    this.getTestseries(testSeriesId)
    this.getTestsByTestSeries(testSeriesId)

    this.transformData();

  }

  getTestSeriesId() {
    return this.route.snapshot.params['id']
  }

 

  calculateTimeDifference() {
    if (this.startTime && this.endTime) {
      const start = new Date(`1970-01-01T${this.startTime}:00`);
      const end = new Date(`1970-01-01T${this.endTime}:00`);
      
      // Ensure end time is after start time, if not adjust for the next day
      // if (end < start) {
      //   end.setDate(end.getDate() + 1); // Adding 1 day to handle cases where the end time is the next day
      // }

        // Validation: Check if the end time is earlier than the start time
    if (end < start) {
      console.error("End time cannot be earlier than start time.");
      this.testForm.duration = null; // Clear the duration
      return; // Exit the function
    }

      const diff = (end.getTime() - start.getTime()) / (1000 * 60); // Convert milliseconds to minutes
      this.testForm.duration = diff;
    }
  }

  


  calculateTotalQuestions() {
    // Get values and convert to numbers, defaulting to 0 if invalid
    const easyQuestions = Number(this.questionForm.get('easyQuestions')?.value) || 0;
    const mediumQuestions = Number(this.questionForm.get('mediumQuestions')?.value) || 0;
    const hardQuestions = Number(this.questionForm.get('hardQuestions')?.value) || 0;

    // Calculate total questions
    this.totalQuestions = easyQuestions + mediumQuestions + hardQuestions;


    // Log the total questions for debugging

    // Check if the total questions exceed the available total question count
    if (this.totalQuestions > this.totalQuestionCount) {
      // Alert if the total questions exceed the available count
      alert('Total questions exceed the available question count!');
    }
  }


 

  addKeyWordsChip(): void {
    const trimmedKeyword = this.keywordsInput.trim();
    
    if (trimmedKeyword) {
      // Add trimmed value to the chips array
      this.testForm.keyWords.push(trimmedKeyword);
      
      // Clear the input field
      this.keywordsInput = '';
      
      // Debugging: Check the chips array after adding a new chip
    }
  }
  
  removeKeyWordsChip(index: number): void {
    // Remove chip by index from the chips array
    this.testForm.keyWords.splice(index, 1);
  }



  addTopicsChip(): void {
    const trimmedKeyword = this.topicsInput.trim();
    
    if (trimmedKeyword) {
      // Add trimmed value to the chips array
      this.testForm.topics.push(trimmedKeyword);
      
      // Clear the input field
      this.topicsInput = '';
      
      // Debugging: Check the chips array after adding a new chip
    }
  }
  
  removeTopicsChip(index: number): void {
    // Remove chip by index from the chips array
    this.testForm.topics.splice(index, 1);
  }


  addCategoryChip(option: Category): void {
    if (this.testForm.categoryIds.indexOf(option) === -1) {  // Avoid duplicates
      this.testForm.categoryIds.push(option);
    }
   
  }
  
  removeCategoryChip(index: number): void {
    // Remove chip by index from the chips array
    this.testForm.categoryIds.splice(index, 1);
  }




  onFileChange(e: any) {
    const selectedFiles = e.target.files;
      // Convert the FileList object to an array and add to the files array
      for (let i = 0; i < selectedFiles.length; i++) {
        this.testForm.files.push(selectedFiles[i]);
      }
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
  public allTest: any[] = []; // To hold categories

  public isCreateNewCategory: boolean = true;

  public AllMappedCat: CategoryList[] = [];

  // Options available in the dropdown
  // public options: string[] = ['Apple', 'Banana', 'Cherry', 'Date', 'Grape', 'Lemon', 'Mango'];
  public filteredOptions: any[] = []; // Filtered options for search
  public searchQuery: string = ''; // Current search input value
  public searchCategory: string = '';
  public searchCatSubject: Subject<string> = new Subject<string>();

  public selectedOption: any; // Holds the selected option
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
    private testSeriesTestMapping : TestSeriesTestMappingService
  ) {
    this.searchCatSubject.pipe(debounceTime(300)).subscribe((query) => {
      this.searchCategory = query; // Assign the value to searchQuery
    });
  }

  // ngOnInit() {

  // }

  addChip(): void {
    if (this.chipInput.trim()) {
      this.chips.push(this.chipInput.trim());
      this.chipInput = ''; // Clear input
    }
  }

  removeChip(index: number): void {
    this.chips.splice(index, 1);
  }

  // Toggles dropdown visibility
  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Filters categories based on search query
  filterOptions() {
    if (
      this.searchQuery.trim() &&
      this.allTest &&
      this.allTest.length > 0
    ) {
      // Filter categories based on catName, case insensitive
      this.filteredOptions = this.allTest.filter((test) =>
        test.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      // If searchQuery is empty, reset to all categories
      this.filteredOptions = this.allTest ? [...this.allTest] : [];
    }
  }

  selectOption(option: Category): void {
    this.selectedOption = option; // Set the selected option
    this.dropdownOpen = false; // Close dropdown
    this.searchQuery = ''; // Reset search input
    this.filteredOptions = this.allTest ? [...this.allTest] : []; // Reset filtered list
  }

  onMove(val: any) {
    this.subscribeToChanges();
    this.totalQuestionCount = val.totalQuestionCount;
    this.selectedOption = val;
    this.questionForm.patchValue({
      id: val.id,
      selectedCategory: val.catName,
    });
    this.modalRef = this.modalService.open(this.genQues, {
      scrollable: false,
      ariaLabelledBy: 'modal-basic-title',
    });
  }

    // Subscribe to form control value changes with debounce
    subscribeToChanges() {
      const easyQuestionsSub:any = this.questionForm.get('easyQuestions')?.valueChanges
        .pipe(debounceTime(500))
        .subscribe(() => {
          this.calculateTotalQuestions();
        });
  
      const mediumQuestionsSub:any = this.questionForm.get('mediumQuestions')?.valueChanges
        .pipe(debounceTime(500))
        .subscribe(() => {
          this.calculateTotalQuestions();
        });
  
      const hardQuestionsSub:any = this.questionForm.get('hardQuestions')?.valueChanges
        .pipe(debounceTime(500))
        .subscribe(() => {
          this.calculateTotalQuestions();
        });
  
      // Store subscriptions for later unsubscription
      this.subscriptions.push(easyQuestionsSub, mediumQuestionsSub, hardQuestionsSub);
    }

      // Unsubscribe from all valueChanges observables
  unsubscribeFromChanges() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];  // Clear the subscriptions array
  }


  createTestModel() {
    this.modalRef = this.modalService.open(this.content, {
      // scrollable: true,
      ariaLabelledBy: 'add-test',
    });
  }



  onSearchChange(query: any) {
    this.searchCatSubject.next(query.target.value); // Emit the query to search
  }

  setOpenByCondition(data: any, searchTerm: string) {
    // If the search term is empty, return the data without marking any items as open
    if (!searchTerm.trim()) {
      return data;
    }

    // Split the search term into words and convert them to lowercase for case-insensitive matching
    const searchWords = searchTerm.toLowerCase().split(/\s+/);

    // Define the condition function to match any word from the search term with `catName`
    const conditionFn = (item: any) =>
      searchWords.some((word) => item.catName.toLowerCase().includes(word));

    function searchAndMarkAncestors(data: any): any {
      return data.map((item: any) => {
        // Check if the item meets the partial match condition with any word in searchWords
        if (conditionFn(item)) {
          // Mark this item as open without altering its descendants
          return { ...item, isOpen: true };
        }

        // Recursively check within subCategories
        const updatedSubCategories = searchAndMarkAncestors(item.subCategories);

        // If any subcategories are marked as open, mark this item as open (ancestor)
        if (updatedSubCategories.some((sub: any) => sub.isOpen)) {
          return { ...item, isOpen: true, subCategories: updatedSubCategories };
        }

        // Otherwise, return item with original subCategories
        return { ...item, subCategories: updatedSubCategories };
      });
    }

    return searchAndMarkAncestors(data);
  }

  get filteredCategories() {
    // const data = this.setOpenByCondition(this.AllMappedCat, (item:any) => item.catName.toLowerCase() === this.searchCategory.toLowerCase());
    const data = this.setOpenByCondition(
      this.AllMappedCat,
      this.searchCategory
    );
    return data;
  }

  // Method to get all categories (GET)
  getAllTests(): void {
    this.loading = true; // Set loading state to true while fetching data
    this.testSeriesService
      .getAllTest()
      .pipe(
        tap((response) => {
          
          const tableData = this.tableData.map((item: any) => item.id);
          this.allTest = response.filter((item : any) => !tableData.includes(item.id))
        //  // Assign the fetched categories to the categories array
          this.setFilteration(this.allTest);
        }),
        catchError((error) => {
          this.errorMessage = 'Failed to load categories.';
          console.error('Error fetching categories:', error);
          return of([]); // Return an empty array if there's an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
        })
      )
      .subscribe();
  }

  // getAllMappedCategories(): void {
  //   this.loading = true; // Set loading state to true while fetching data
  //   this.categoriesService
  //     .getallmappedCategories()
  //     .pipe(
  //       tap((response) => {

  //         this.addIsOpenProperty(response);
  //         this.AllMappedCat = response; // Assign the fetched categories to the categories array
  //         this.setFilteration(this.categories);
  //       }),
  //       catchError((error) => {
  //         this.errorMessage = 'Failed to load categories.';
  //         console.error('Error fetching categories:', error);
  //         return of([]); // Return an empty array if there's an error
  //       }),
  //       finalize(() => {
  //         this.loading = false; // Reset loading state when the request is completed
  //       })
  //     )
  //     .subscribe();
  // }

  // addIsOpenProperty(categories: any) {
  //   categories.forEach((category: any) => {
  //     category.isOpen = false; // Add isOpen property

  //     // Recursively call this function for subcategories if they exist
  //     if (category.subCategories && category.subCategories.length > 0) {
  //       this.addIsOpenProperty(category.subCategories);
  //     }
  //   });
  // }

  setFilteration(categories: any) {
    this.filteredOptions = [...categories]; // Filtered options for search
  }

  onToggleCategory(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isCreateNewCategory = !isChecked;
    // You can add your logic here based on whether the switch is on or off
  }

  // createSubCategory(): void {
  //   const reqBody = {
  //     id: this.selectedOption?.id,
  //     catNames: this.chips,
  //   };
  //   this.loading = true; // Start loading

  //   this.categoriesService
  //     .createCategory(reqBody)
  //     .pipe(
  //       tap((response) => {
  //       }),
  //       catchError((error) => {
  //         console.error('Error creating category:', error);
  //         return of(error); // Return an observable to handle the error
  //       }),
  //       finalize(() => {
  //         this.loading = false; // Stop loading
  //         this.selectedOption = null;
  //         this.chips = [];
  //         this.getCategories();
  //         this.getAllMappedCategories();
  //       })
  //     )
  //     .subscribe();
  // }

  // createNewCategory() {
  //   const reqBody = {
  //     catNames: this.chips,
  //   };
  //   this.loading = true; // Start loading

  //   this.categoriesService
  //     .createCategory(reqBody)
  //     .pipe(
  //       tap((response) => {
  //       }),
  //       catchError((error) => {
  //         console.error('Error creating category:', error);
  //         return of(error); // Return an observable to handle the error
  //       }),
  //       finalize(() => {
  //         this.loading = false; // Stop loading
  //         this.selectedOption = null;
  //         this.chips = [];
  //         this.getCategories();
  //         this.getAllMappedCategories();
  //       })
  //     )
  //     .subscribe();
  // }

  // genQuestions() {
  //   const reqBody = {
  //     categoryIds: [this.questionForm.get('id')?.value],
  //     numberOfQuestionsEasy: this.questionForm.get('easyQuestions')?.value,
  //     numberOfQuestionsMedium: this.questionForm.get('mediumQuestions')?.value,
  //     numberOfQuestionsHard: this.questionForm.get('hardQuestions')?.value,
  //   };

  //   this.loading = true; // Start loading
  //   this.genQuesAsyncCall = true;

  //   this.testSeriesService
  //     .fetchQuestionsForTest(reqBody)
  //     .pipe(
  //       tap((response) => {
  //         this.AccordionData = response;
  //         this.transformData();
  //       }),
  //       catchError((error) => {
  //         console.error('Error updating category:', error);
  //         return of(error); // Return an observable to handle the error
  //       }),
  //       finalize(() => {
  //         this.questionForm.reset();
  //         this.closeModal();
  //         this.selectedOption = null;
  //         this.loading = false; // Stop loading
  //         this.genQuesAsyncCall = false;
  //       })
  //     )
  //     .subscribe();
  // }

  // createTest() {
  //   this.testForm.categoryIds = this.testForm.categoryIds.map((r:any) => r.id)
  //   this.loading = true; // Start loading
  //   this.createTestAsyncCall = true;


  //   this.testSeriesService
  //     .createTest(this.testForm)
  //     .pipe(
  //       tap((response) => {
         
          
  //       }),
  //       catchError((error) => {
  //         console.error('Error creating test:', error);
  //         return of(error); // Return an observable to handle the error
  //       }),
  //       finalize(() => {
  //         this.getTestsByTestSeries(this.getTestSeriesId())
  //         this.resetTestForm();
  //         this.closeModal();

  //         this.loading = false; // Stop loading
  //         this.createTestAsyncCall = false;
  //       })
  //     )
  //     .subscribe();

    
  // }

  resetTestForm() {
    this.testForm = {
      title: '',
      subTitle: '',
      keyWords: [],
      files: [],
      minimumPassingScore: '',
      topics: [],
      duration: '',
      language: '',
      categoryIds: []
    };

    this.startTime = '';
    this.endTime = '';
  }

  // editTest() {
  //   this.testForm.categoryIds = this.testForm.categoryIds.map((r:any) => r.id)
  // }


  // EditTestseries() {
      
  //     const reqBody = {
  //       name: this.testSeriesDetails.name,
  //       medium: this.testSeriesDetails.medium,
  //       details: this.testSeriesDetails.details,
  //       startDate: this.testSeriesDetails.startDate,
  //       fee: this.testSeriesDetails.fee,
  //       isActive : true
  //     }
  
  
  //     this.loading = true; // Set loading state to true while fetching data
    
  //     this.testSeriesService.updateTestSeries(this.testSeriesDetails.id, reqBody).pipe(
  //       tap((response: any) => {
  //       }),
  //       catchError((error) => {
  //         this.errorMessage = 'Error creating test series.'; // Handle error message
  //         console.error('Error creating test series:', error);
  //         return of([]); // Return an empty array in case of an error
  //       }),
  //       finalize(() => {
  //         this.loading = false; // Reset loading state when the request is completed
  //       })
  //     ).subscribe();
  //   }


  getTestseries(id: any) {


    this.loading = true; // Start loading
   

    this.testSeriesService
      .getTestSeriesById(id)
      .pipe(
        tap((response) => {
          this.testSeriesDetails =  response.response
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
         
        })
      )
      .subscribe();
  }


  addQuesToTest() {
    let Obj = {
      testId: this.testForm.id,
      questionIds : this.AccordionData.map((r:any) => r.id)
    }
    
    this.loading = true; // Start loading
   

    this.testSeriesService
      .addQuestionToTest(Obj)
      .pipe(
        tap((response) => {
          // this.testSeriesDetails =  response.response
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
          this.generateQues = false;
         

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
          this.tableData = response; // Assign the fetched data to the list
          this.showColumns  = this.generateTableHeaders(response.map(({ id,keywords,files,topics,categories,minimumPassingScore, ...rest }: any) => rest));
          this.tableHeaders = this.generateTableHeaders(response)
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
          this.getAllTests();
        })
      )
      .subscribe();
  }


  public isElementInChips(element: Category): boolean {
    // return this.chips.includes(element);
    return this.testForm.categoryIds.some((chip: any) => chip.id === element.id);
  }



  createMapping() {

    // console.log()
    // console.log(this.testForm.categoryIds)
    // this.loading = true; // Start loading

    const Obj = {
      testSeriesId: this.getTestSeriesId(),
      testIds: this.testForm.categoryIds.map((q: any)=> q.id)
    }

    console.log(Obj)
   

    this.testSeriesTestMapping
      .createMapping(Obj)
      .pipe(
        tap((response) => {
          console.log(response)
          // this.tableData = response; // Assign the fetched data to the list
          // this.showColumns  = this.generateTableHeaders(response.map(({ id,keywords,files,topics,categories,minimumPassingScore, ...rest }: any) => rest));
          // this.tableHeaders = this.generateTableHeaders(response)
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
          this.testForm.categoryIds = []
          this.closeModal();
          this.getTestsByTestSeries(this.getTestSeriesId())
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

  deleteGeneratedQues(val: any) {
    this.AccordionData = this.AccordionData.filter(
      (item: any) => item.id !== val.id
    );
    this.transformData();
  }

  // DeleteCategory(id: any) {
  //   this.categoriesService
  //     .deleteCategory(id)
  //     .pipe(
  //       tap((response) => {
  //       }),
  //       catchError((error) => {
  //         console.error('Error deleting category:', error);
  //         return of(error); // Return an observable to handle the error
  //       }),
  //       finalize(() => {
  //         this.getCategories();
  //         this.getAllMappedCategories();
  //       })
  //     )
  //     .subscribe();
  // }

  deleteTest(val: any) {
    this.testSeriesTestMapping
    .DeleteTestFromMapping(this.getTestSeriesId() , val.id)
    .pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error deleting test:', error);
        return of(error); // Return an observable to handle the error
      }),
      finalize(() => {
        this.getTestsByTestSeries(this.getTestSeriesId())
      })
    )
    .subscribe();
  }



  closeModal() {
    if (this.modalRef) {
      
      this.modalRef.close(); // Close the modal
    }
    if(this.isEditTest) {
      this.isEditTest = false;
    }

    this.unsubscribeFromChanges()
  }

  // Detect clicks outside the component to close the dropdown
  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement): void {
    if (targetElement.id !== 'dropdownOpen') {
      this.dropdownOpen = false;
    }
  }
}
