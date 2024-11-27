import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TableComponent } from '../../../../shared/resusable_components/table/table.component';
import { AsyncButtonComponent } from '../../../../shared/resusable_components/async-button/async-button.component';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime, tap, catchError, of, finalize } from 'rxjs';
import { Category, CategoryList, apiResponse } from '../../../../core/models/interface/categories.interface';
import { CategoriesService } from '../../../../core/services/categories.service';
import { TestSeriesService } from '../../../../core/services/test-series.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-test-series-details',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    AsyncButtonComponent,
    FormsModule,
    ReactiveFormsModule,
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
    minimumPassingScore: null as number | null,
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



  tableHeaders: any = [
    // { key: 'id', displayName: 'ID' },
    // { key: 'name', displayName: 'Test Name' },
    // { key: 'date', displayName: 'Date' },
    // { key: 'duration', displayName: 'Duration' },
  ];

  tableData: any = [
    // {
    //   id: '1',
    //   name: 'Math Test 1',
    //   date: '2024-11-12',
    //   duration: '60 mins',
    // },
    // {
    //   id: '2',
    //   name: 'Science Quiz',
    //   date: '2024-11-14',
    //   duration: '45 mins',
    // },
    // {
    //   id: '3',
    //   name: 'History Test',
    //   date: '2024-11-16',
    //   duration: '90 mins',
    // },
    // {
    //   id: '4',
    //   name: 'English Literature',
    //   date: '2024-11-18',
    //   duration: '60 mins',
    // },
    // {
    //   id: '5',
    //   name: 'General Knowledge',
    //   date: '2024-11-20',
    //   duration: '30 mins',
    // },
    // {
    //   id: '6',
    //   name: 'Physics Test',
    //   date: '2024-11-22',
    //   duration: '120 mins',
    // },
    // {
    //   id: '7',
    //   name: 'Chemistry Quiz',
    //   date: '2024-11-24',
    //   duration: '75 mins',
    // },
    // {
    //   id: '8',
    //   name: 'Biology Test',
    //   date: '2024-11-26',
    //   duration: '60 mins',
    // },
    // {
    //   id: '9',
    //   name: 'Economics Test',
    //   date: '2024-11-28',
    //   duration: '90 mins',
    // },
    // {
    //   id: '10',
    //   name: 'Geography Test',
    //   date: '2024-11-30',
    //   duration: '60 mins',
    // },
  ];

  actionsConfig = [
    {
      key: 'edit',
      label: 'Edit',
      class: 'btn btn-outline-primary',
      visible: true,
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
      visible: true,
    },
  ];

  // JSON Data
  AccordionData: any = [
    // {
    //   id: '1',
    //   question: 'What does the law of demand state?',
    //   a: 'As the price increases, demand decreases',
    //   b: 'As the price increases, demand increases',
    //   c: 'As the price decreases, demand decreases',
    //   d: 'Demand is independent of price',
    //   complexity: 'Easy',
    //   categoryId: 'cat1',
    //   categoryName: 'Microeconomics',
    //   description:
    //     'The law of demand states that as the price of a good increases, the quantity demanded decreases, and vice versa.'
    // },
    // {
    //   id: '2',
    //   question: 'What is the basic economic problem?',
    //   a: 'Unlimited wants and limited resources',
    //   b: 'Limited wants and unlimited resources',
    //   c: 'Balanced supply and demand',
    //   d: 'Efficient resource allocation',
    //   complexity: 'Medium',
    //   categoryId: 'cat1',
    //   categoryName: 'Microeconomics',
    //   description:
    //     'The basic economic problem arises due to unlimited human wants and limited resources to fulfill those wants.'
    // },
    // {
    //   id: '3',
    //   question: 'What is the capital of France?',
    //   a: 'Berlin',
    //   b: 'Madrid',
    //   c: 'Paris',
    //   d: 'Rome',
    //   complexity: 'Easy',
    //   categoryId: 'cat2',
    //   categoryName: 'Geography',
    //   description: 'Paris is the capital city of France.'
    // },
    // {
    //   id: '4',
    //   question: 'Which river is the longest in the world?',
    //   a: 'Amazon',
    //   b: 'Nile',
    //   c: 'Yangtze',
    //   d: 'Mississippi',
    //   complexity: 'Medium',
    //   categoryId: 'cat2',
    //   categoryName: 'Geography',
    //   description: 'The Nile River is considered the longest river in the world.'
    // },
    // {
    //   id: '5',
    //   question: 'What is 2 + 2?',
    //   a: '3',
    //   b: '4',
    //   c: '5',
    //   d: '6',
    //   complexity: 'Easy',
    //   categoryId: 'cat3',
    //   categoryName: 'Mathematics',
    //   description: '2 + 2 equals 4.'
    // },
    // {
    //   id: '6',
    //   question: 'What is the square root of 16?',
    //   a: '2',
    //   b: '3',
    //   c: '4',
    //   d: '5',
    //   complexity: 'Medium',
    //   categoryId: 'cat3',
    //   categoryName: 'Mathematics',
    //   description: 'The square root of 16 is 4.'
    // },
    // {
    //   id: '7',
    //   question: 'Who wrote "Hamlet"?',
    //   a: 'Charles Dickens',
    //   b: 'William Shakespeare',
    //   c: 'Jane Austen',
    //   d: 'Leo Tolstoy',
    //   complexity: 'Easy',
    //   categoryId: 'cat4',
    //   categoryName: 'Literature',
    //   description: 'William Shakespeare is the author of "Hamlet".'
    // },
    // {
    //   id: '8',
    //   question: 'What is the genre of "1984"?',
    //   a: 'Romance',
    //   b: 'Science Fiction',
    //   c: 'Dystopian',
    //   d: 'Fantasy',
    //   complexity: 'Medium',
    //   categoryId: 'cat4',
    //   categoryName: 'Literature',
    //   description: 'George Orwell’s "1984" is a dystopian novel.'
    // },
    // {
    //   id: '9',
    //   question: 'What is the powerhouse of the cell?',
    //   a: 'Nucleus',
    //   b: 'Ribosome',
    //   c: 'Mitochondria',
    //   d: 'Chloroplast',
    //   complexity: 'Easy',
    //   categoryId: 'cat5',
    //   categoryName: 'Biology',
    //   description: 'Mitochondria is known as the powerhouse of the cell.'
    // },
    // {
    //   id: '10',
    //   question: 'Which organ is responsible for filtering blood?',
    //   a: 'Heart',
    //   b: 'Liver',
    //   c: 'Kidney',
    //   d: 'Lungs',
    //   complexity: 'Medium',
    //   categoryId: 'cat5',
    //   categoryName: 'Biology',
    //   description: 'Kidneys filter the blood in the human body.'
    // },
    // {
    //   id: '11',
    //   question: 'What is Newton’s First Law of Motion?',
    //   a: 'Force equals mass times acceleration',
    //   b: 'Every action has an equal and opposite reaction',
    //   c: 'An object in motion stays in motion unless acted on by an external force',
    //   d: 'The force of gravity is constant',
    //   complexity: 'Easy',
    //   categoryId: 'cat6',
    //   categoryName: 'Physics',
    //   description:
    //     'Newton’s First Law states that an object will remain at rest or in uniform motion unless acted upon by an external force.'
    // },
    // {
    //   id: '12',
    //   question: 'What is the speed of light?',
    //   a: '299,792 km/s',
    //   b: '299,792 m/s',
    //   c: '3,000 km/s',
    //   d: '3,000 m/s',
    //   complexity: 'Medium',
    //   categoryId: 'cat6',
    //   categoryName: 'Physics',
    //   description: 'The speed of light in a vacuum is approximately 299,792 km/s.'
    // },
    // Add more categories and MCQs as needed
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
    // console.log(`Action: ${event.action}, Row:`, event.row);
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
    console.log(e);
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
    console.log(e);
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
      .getTestById(e.id)
      .pipe(
        tap((response) => {
          console.log('successfull:', response);
          this.AccordionData = response;
          this.transformData();
          
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

  ngOnInit(): void {
    // this.showColumns = this.tableHeaders;
    this.getCategories();
    this.getAllMappedCategories();

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

 

  addKeyWordsChip(): void {
    const trimmedKeyword = this.keywordsInput.trim();
    
    if (trimmedKeyword) {
      // Add trimmed value to the chips array
      this.testForm.keyWords.push(trimmedKeyword);
      
      // Clear the input field
      this.keywordsInput = '';
      
      // Debugging: Check the chips array after adding a new chip
      console.log(this.testForm.keyWords);
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
      console.log(this.testForm.topics);
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
    console.log(index)
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
    private route : ActivatedRoute
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
      this.categories &&
      this.categories.length > 0
    ) {
      // Filter categories based on catName, case insensitive
      this.filteredOptions = this.categories.filter((category) =>
        category.catName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      // If searchQuery is empty, reset to all categories
      this.filteredOptions = this.categories ? [...this.categories] : [];
    }
  }

  selectOption(option: Category): void {
    this.selectedOption = option; // Set the selected option
    console.log(this.selectedOption);
    this.dropdownOpen = false; // Close dropdown
    this.searchQuery = ''; // Reset search input
    this.filteredOptions = this.categories ? [...this.categories] : []; // Reset filtered list
  }

  onMove(val: any) {
    console.log(val);

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


  createTestModel() {
    this.modalRef = this.modalService.open(this.content, {
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title',
    });
  }



  onSearchChange(query: any) {
    console.log(query.target.value);
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
    // console.log(data, this.searchCategory)
    return data;
  }

  // Method to get all categories (GET)
  getCategories(): void {
    this.loading = true; // Set loading state to true while fetching data
    this.categoriesService
      .getCategories()
      .pipe(
        tap((response) => {
          console.log('Categories fetched successfully:', response);
          var res: apiResponse = response;
          this.categories = res.response; // Assign the fetched categories to the categories array
          this.setFilteration(this.categories);
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

  getAllMappedCategories(): void {
    this.loading = true; // Set loading state to true while fetching data
    this.categoriesService
      .getallmappedCategories()
      .pipe(
        tap((response) => {
          console.log('Categories fetched successfully:', response);

          this.addIsOpenProperty(response);
          this.AllMappedCat = response; // Assign the fetched categories to the categories array
          this.setFilteration(this.categories);
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

  addIsOpenProperty(categories: any) {
    categories.forEach((category: any) => {
      category.isOpen = false; // Add isOpen property

      // Recursively call this function for subcategories if they exist
      if (category.subCategories && category.subCategories.length > 0) {
        this.addIsOpenProperty(category.subCategories);
      }
    });
  }

  setFilteration(categories: any) {
    this.filteredOptions = [...categories]; // Filtered options for search
  }

  onToggleCategory(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    console.log('Switch toggled:', !isChecked);
    this.isCreateNewCategory = !isChecked;
    // You can add your logic here based on whether the switch is on or off
  }

  createSubCategory(): void {
    const reqBody = {
      id: this.selectedOption?.id,
      catNames: this.chips,
    };
    this.loading = true; // Start loading

    this.categoriesService
      .createCategory(reqBody)
      .pipe(
        tap((response) => {
          console.log('Category created successfully:', response);
        }),
        catchError((error) => {
          console.error('Error creating category:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.loading = false; // Stop loading
          console.log('Category creation request completed.');
          this.selectedOption = null;
          this.chips = [];
          this.getCategories();
          this.getAllMappedCategories();
        })
      )
      .subscribe();
  }

  createNewCategory() {
    const reqBody = {
      catNames: this.chips,
    };
    this.loading = true; // Start loading

    this.categoriesService
      .createCategory(reqBody)
      .pipe(
        tap((response) => {
          console.log('Category created successfully:', response);
        }),
        catchError((error) => {
          console.error('Error creating category:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.loading = false; // Stop loading
          console.log('Category creation request completed.');
          this.selectedOption = null;
          this.chips = [];
          this.getCategories();
          this.getAllMappedCategories();
        })
      )
      .subscribe();
  }

  genQuestions() {
    const reqBody = {
      categoryIds: [this.questionForm.get('id')?.value],
      numberOfQuestionsEasy: this.questionForm.get('easyQuestions')?.value,
      numberOfQuestionsMedium: this.questionForm.get('mediumQuestions')?.value,
      numberOfQuestionsHard: this.questionForm.get('hardQuestions')?.value,
    };
    console.log(reqBody);

    this.loading = true; // Start loading
    this.genQuesAsyncCall = true;

    this.testSeriesService
      .fetchQuestionsForTest(reqBody)
      .pipe(
        tap((response) => {
          console.log('Category updated successfully:', response);
          this.AccordionData = response;
          this.transformData();
        }),
        catchError((error) => {
          console.error('Error updating category:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.questionForm.reset();
          this.closeModal();
          this.selectedOption = null;
          this.loading = false; // Stop loading
          this.genQuesAsyncCall = false;
          console.log('Category updation request completed.');
        })
      )
      .subscribe();
  }

  createTest() {
    this.testForm.categoryIds = this.testForm.categoryIds.map((r:any) => r.id)
    this.loading = true; // Start loading
    this.createTestAsyncCall = true;

    this.testSeriesService
      .createTest(this.getTestSeriesId(), this.testForm)
      .pipe(
        tap((response) => {
          console.log('Test created successfully:', response);
         
          
        }),
        catchError((error) => {
          console.error('Error creating test:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.getTestsByTestSeries(this.getTestSeriesId())
          this.resetTestForm();
          this.closeModal();

          this.loading = false; // Stop loading
          this.createTestAsyncCall = false;
          console.log('test creation request completed.');
        })
      )
      .subscribe();

    
  }

  resetTestForm() {
    this.testForm = {
      title: '',
      subTitle: '',
      keyWords: [],
      files: [],
      minimumPassingScore: null,
      topics: [],
      duration: '',
      language: '',
      categoryIds: []
    };
  }

  editTest() {
    console.log('edit')
    this.testForm.categoryIds = this.testForm.categoryIds.map((r:any) => r.id)
    console.log(this.testForm)
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
          console.log(' successfull:', response);
          // this.testSeriesDetails =  response.response
          
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
    console.log(Obj)
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

  deleteGeneratedQues(val: any) {
    this.AccordionData = this.AccordionData.filter(
      (item: any) => item.id !== val.id
    );
    this.transformData();
    console.log(this.AccordionData);
  }

  DeleteCategory(id: any) {
    this.categoriesService
      .deleteCategory(id)
      .pipe(
        tap((response) => {
          console.log('Category deleted successfully:', response);
        }),
        catchError((error) => {
          console.error('Error deleting category:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          console.log('Category deletion request completed.');
          this.getCategories();
          this.getAllMappedCategories();
        })
      )
      .subscribe();
  }

  deleteTest(val: any) {
    this.testSeriesService
    .deleteTest(this.getTestSeriesId() , val.id)
    .pipe(
      tap((response) => {
        console.log('Test deleted successfully:', response);
      }),
      catchError((error) => {
        console.error('Error deleting test:', error);
        return of(error); // Return an observable to handle the error
      }),
      finalize(() => {
        this.getTestsByTestSeries(this.getTestSeriesId())
        console.log('Test deletion request completed.');
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
  }

  // Detect clicks outside the component to close the dropdown
  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement): void {
    if (targetElement.id !== 'target_Dropdown') {
      this.dropdownOpen = false;
    }
  }
}
