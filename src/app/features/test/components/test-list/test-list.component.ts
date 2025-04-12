import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AsyncButtonComponent } from '../../../../shared/resusable_components/async-button/async-button.component';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../shared/resusable_components/table/table.component';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { catchError, debounceTime, finalize, of, Subject, Subscription, tap } from 'rxjs';
import { apiResponse, Category, CategoryList } from '../../../../core/models/interface/categories.interface';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CategoriesService } from '../../../../core/services/categories.service';
import { TestSeriesService } from '../../../../core/services/test-series.service';
import { CourseService } from '../../../../core/services/course.service';
import Quill from 'quill';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-test-list',
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
  templateUrl: './test-list.component.html',
  styleUrl: './test-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TestListComponent implements OnInit {
 public isCreateQuesToTest: boolean = false;
  public showColumns: any;
  public GeneratedQuestions: any;
  public questionForm!: FormGroup;
  public testSeriesDetails: any;
  public quillEditor: Quill[] | undefined;
  public originalData: any[] = [];
  public dropdownLanguageOpen : boolean = false;
  public selectedLanguageOption: any| null = null;
  public filteredLanguageOptions : any[] | null = [];
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
      visible: true,
    },
  ];

  languages =  [
    "English",
    "Hindi",
    "Gujarati",
  
  ]

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
   
    this.getCourseByTestId(e.id)
    this.testSeriesService
      .getTestPaperById(e.id)
      .pipe(
        tap((response) => {
          if(this.originalData.length === 0) {
            this.originalData = response

          }
          this.AccordionData = response;
          this.GeneratedQuestions = response;
          
            this.initilizeEditor();

          console.log(this.GeneratedQuestions)

          // this.transformData();
          
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

  getCategoriesOfData(data: any): any[] {
    return [...new Set(data.map((res: any)=> res.categoryName))]
  }


  public toggleLanguageDropdown(): void {
    this.dropdownLanguageOpen = !this.dropdownLanguageOpen;
  }


  public filterLanguageOptions() {
      
    if (this.searchQuery.trim() && this.languages && this.languages.length > 0) {
      // Filter categories based on catName, case insensitive
      this.filteredLanguageOptions = this.languages.filter(type =>
        type.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      // If searchQuery is empty, reset to all categories
      this.filteredLanguageOptions = this.languages ? [...this.languages] : [];
    }
  }

  public selectLanguageOption(option: any): void {
    this.selectedLanguageOption = option; // Set the selected option
    this.testForm.language = option
    this.dropdownLanguageOpen = false; // Close dropdown
    this.searchQuery = ''; // Reset search input
    this.filteredLanguageOptions = this.languages ? [...this.languages] : []; // Reset filtered list
 
  }

  public setLanguageFilteration(type: any) {
    this.filteredLanguageOptions = [...type]; // Filtered options for search
  }

  getCourseByTestId(id: any) {
    this.loading = true; // Start loading
   

    this.courseService
      .getCourseByTestId(id)
      .pipe(
        tap((response) => {
          console.log(response)
          // this.AccordionData = response;
          // this.transformData();
          this.selectedCourseOption = response.parentDetails
          
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

  openCategories = new Map<string, boolean>();

    toggleCategory(categoryId: string,categories?: any) {
      // this.openCategories.set(categoryId, !this.openCategories.get(categoryId)); // Toggle state
      // const category = this.filteredCategories.find((cat: any) => cat.id === categoryId);
      // if (category) {
      //   category.isOpen = !category.isOpen;
      // }

      categories = categories || this.filteredCategories; // Start from the root if no categories are passed

      for (let category of categories) {
        if (category.id === categoryId) {
          category.isOpen = !category.isOpen; // Toggle isOpen
          return;
        }
        if (category.subCategories?.length) {
          this.toggleCategory(categoryId, category.subCategories); // Recursively check subcategories
        }
      }

      
    }

    isCategoryOpen(categoryId: string, categories?: any): boolean {
      // return !!this.openCategories.get(categoryId); // Get state (default false)
      // const category = this.filteredCategories.find((cat: any) => cat.id === categoryId);
      // return category ? category.isOpen || this.openCategories.has(categoryId) : false;

      categories = categories || this.filteredCategories; // Start from root if no categories are passed

      for (let category of categories) {
        if (category.id === categoryId) {
          return category.isOpen === true; // Return isOpen state
        }
        if (category.subCategories?.length) {
          if (this.isCategoryOpen(categoryId, category.subCategories)) {
            return true; // If any nested category is open, return true
          }
        }
      }
      return false; // Default to false if not found
    }


  ngOnInit(): void {
    // this.showColumns = this.tableHeaders;
    this.setLanguageFilteration(this.languages)
    this.loadAllCourses();
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
        // Validators.required,
        Validators.min(1),
      ]),
      mediumQuestions: new FormControl('', [
        // Validators.required,
        Validators.min(1),
      ]),
      hardQuestions: new FormControl('', [
        // Validators.required,
        Validators.min(1),
      ]),

      totalQuestions: new FormControl('')
    }, { validators: this.atLeastOneQuestionValidator() });

    this.questionForm.get('easyQuestions')?.valueChanges.subscribe(() => {
      this.questionForm.updateValueAndValidity();
    });
    this.questionForm.get('mediumQuestions')?.valueChanges.subscribe(() => {
      this.questionForm.updateValueAndValidity();
    });
    this.questionForm.get('hardQuestions')?.valueChanges.subscribe(() => {
      this.questionForm.updateValueAndValidity();
    });



    const testSeriesId  = this.getTestSeriesId()
    // this.getTestseries(testSeriesId)
    this.getAllTests()

    this.transformData();

    

  }


  atLeastOneQuestionValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const easy = group.get('easyQuestions')?.value;
      const medium = group.get('mediumQuestions')?.value;
      const hard = group.get('hardQuestions')?.value;
  
      const hasAtLeastOne = [easy, medium, hard].some(val => !!val && val > 0);
  
      return hasAtLeastOne ? null : { atLeastOneRequired: true };
    };
  }

  initilizeEditor() {
    setTimeout(() => {
    this.GeneratedQuestions.forEach((mcq: any, index: any) => {
      this.initializeQuill(`quill-question-${index}`, mcq.question);
      this.initializeQuill(`quill-optionA-${index}`, mcq.a);
      this.initializeQuill(`quill-optionB-${index}`, mcq.b);
      this.initializeQuill(`quill-optionC-${index}`, mcq.c);
      this.initializeQuill(`quill-optionD-${index}`, mcq.d);
    });
    }, 100)
  }

  initializeQuill(elementId: string, content: string) {
    const container = document.getElementById(elementId);
    if (container) {
      const quill = new Quill(container, {
        theme: 'snow',
        readOnly: true,
        modules: { toolbar: [] }
      });
      quill.root.innerHTML = content;
    }
  }

  

  getTestSeriesId() {
    return this.route.snapshot.params['id']
  }


  private loadAllCourses(): void {
    this.loading = true; // Set loading state to true while fetching data
  
    this.courseService.getAllCourses().pipe(
      tap((response: any) => {
        console.log(response)
        this.allCourses = response
        this.setCourseFilteration(this.allCourses);
        
      }),
      catchError((error) => {
        this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
        console.error('Error loading Daily editorials:', error);
        this.allCourses = []; 
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
      })
    ).subscribe();
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
    console.log(this.GeneratedQuestions)

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

  public allCourses: any = []

  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public categories: Category[] | null = []; // To hold categories

  public isCreateNewCategory: boolean = true;

  public AllMappedCat: CategoryList[] = [];

  // Options available in the dropdown
  // public options: string[] = ['Apple', 'Banana', 'Cherry', 'Date', 'Grape', 'Lemon', 'Mango'];
  public filteredOptions: Category[] | null = []; // Filtered options for search
  public filteredCourseOptions: any[] | null = []; // Filtered options for search
  public searchQuery: string = ''; // Current search input value
  public searchCategory: string = '';
  public searchCatSubject: Subject<string> = new Subject<string>();

  public selectedOption: Category | null = null; // Holds the selected option
  public selectedCatOption: Category | null = null; // Holds the selected option
  public selectedCourseOption: any | null = null; // Holds the selected option
  public dropdownOpen: boolean = false; // Controls dropdown visibility
  public dropdownCourseOpen: boolean = false;
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
    private courseService: CourseService,
    public sanitizer: DomSanitizer
  ) {
    this.searchCatSubject.pipe(debounceTime(300)).subscribe((query) => {
      this.searchCategory = query; // Assign the value to searchQuery
      console.log(this.searchCategory)
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

  toggleCourseDropdown(): void {
    this.dropdownCourseOpen = !this.dropdownCourseOpen;
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

  filtereCourseOptions() {
    if (
      this.searchQuery.trim() &&
      this.allCourses &&
      this.allCourses.length > 0
    ) {
      // Filter categories based on catName, case insensitive
      this.filteredCourseOptions = this.allCourses.filter((course: any) =>
        course.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      // If searchQuery is empty, reset to all categories
      this.filteredCourseOptions = this.allCourses ? [...this.allCourses] : [];
    }
  }

  // filteredCourseOptions

  selectOption(option: Category): void {
    this.selectedOption = option; // Set the selected option
    this.dropdownOpen = false; // Close dropdown
    this.searchQuery = ''; // Reset search input
    this.filteredOptions = this.categories ? [...this.categories] : []; // Reset filtered list
  }

  selectCatOption(option: Category):void {
    console.log(option, this.AccordionData)
    this.GeneratedQuestions = this.AccordionData.filter((res: any) => res.categoryName === option.catName)
    console.log(this.GeneratedQuestions)
    this.selectedCatOption = option; // Set the selected option
    this.dropdownOpen = false; // Close dropdown
    this.searchQuery = ''; // Reset search input
    this.filteredOptions = this.categories ? [...this.categories] : []; // Reset filtered list
    this.initilizeEditor();
  }

  selectCourseOption(option: any): void {
    
    this.selectedCourseOption = option; // Set the selected option
    console.log(this.selectedCourseOption.id)
    this.dropdownOpen = false; // Close dropdown
    this.searchQuery = ''; // Reset search input
    this.filteredCourseOptions = this.allCourses ? [...this.allCourses] : []; // Reset filtered list
  }

  onMove(val: any) {
    this.subscribeToChanges();
    this.totalQuestionCount = val.totalQuestionCount;
    this.selectedOption = val;
    this.questionForm.patchValue({
      id: val.id,
      selectedCategory: val.catName,
      totalQuestions: val.totalQuestionCount

    });
    this.modalRef = this.modalService.open(this.genQues, {
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title',
    });


    this.modalRef.result.then(
      (result) => {
        console.log('Modal closed with result:', result);
        this.questionForm.reset();
        this.selectedLanguageOption = null;
        this.selectedOption = null
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
        this.questionForm.reset();
        this.selectedLanguageOption = null;
        this.selectedOption = null
      }
    );
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
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title',
    });
  }



  onSearchChange(query: any) {
    console.log(query.target.value)
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
  getCategories(): void {
    this.loading = true; // Set loading state to true while fetching data
    this.categoriesService
      .getCategories()
      .pipe(
        tap((response) => {
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

  setCourseFilteration(course: any) {
    this.filteredCourseOptions = [...course]; // Filtered options for search
  }

  onToggleCategory(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
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
        }),
        catchError((error) => {
          console.error('Error creating category:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.loading = false; // Stop loading
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
        }),
        catchError((error) => {
          console.error('Error creating category:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.loading = false; // Stop loading
          this.selectedOption = null;
          this.chips = [];
          this.getCategories();
          this.getAllMappedCategories();
        })
      )
      .subscribe();
  }

  genQuestions() {
    const reqBody: any = {
      categoryIds: [this.questionForm.get('id')?.value],
      language: this.selectedLanguageOption,
      numberOfQuestionsEasy: this.questionForm.get('easyQuestions')?.value || 0,
      numberOfQuestionsMedium: this.questionForm.get('mediumQuestions')?.value || 0,
      numberOfQuestionsHard: this.questionForm.get('hardQuestions')?.value || 0,
    };

    if(this.selectedCourseOption != null) {
      reqBody.courseId = this.selectedCourseOption.id
    }

    this.loading = true; // Start loading
    this.genQuesAsyncCall = true;

    this.testSeriesService
      .fetchQuestionsForTest(reqBody)
      .pipe(
        tap((response) => {
          // this.AccordionData = response;
          // this.AccordionData = [...this.AccordionData, ...response];
          const merged = [...this.AccordionData, ...response];
          // Remove duplicates by `id`
          const uniqueById = Array.from(
            new Map(merged.map(item => [item.id, item])).values()
          );
          this.AccordionData = uniqueById;
          this.GeneratedQuestions = [...this.AccordionData]
          // this.transformData();
          this.initilizeEditor();
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
          this.selectedLanguageOption = null;
        })
      )
      .subscribe();
  }

  createTest() {
    this.testForm.categoryIds = this.testForm.categoryIds.map((r:any) => r.id)
    this.loading = true; // Start loading
    this.createTestAsyncCall = true;

    this.testSeriesService
      .createTest(this.testForm)
      .pipe(
        tap((response) => {
         console.log(response)
          
        }),
        catchError((error) => {
          console.error('Error creating test:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.getAllTests()
          this.resetTestForm();
          this.closeModal();

          this.loading = false; // Stop loading
          this.createTestAsyncCall = false;
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
      minimumPassingScore: '',
      topics: [],
      duration: '',
      language: '',
      categoryIds: []
    };

    this.startTime = '';
    this.endTime = '';
  }

  editTest() {
    this.testForm.categoryIds = this.testForm.categoryIds.map((r:any) => r.id)
  }


  EditTestseries() {
      
      const reqBody = {
        name: this.testSeriesDetails.name,
        medium: this.testSeriesDetails.medium,
        details: this.testSeriesDetails.details,
        startDate: this.testSeriesDetails.startDate,
        fee: this.testSeriesDetails.fee,
        isActive : true
      }
  
  
      this.loading = true; // Set loading state to true while fetching data
    
      this.testSeriesService.updateTestSeries(this.testSeriesDetails.id, reqBody).pipe(
        tap((response: any) => {
        }),
        catchError((error) => {
          this.errorMessage = 'Error creating test series.'; // Handle error message
          console.error('Error creating test series:', error);
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
        })
      ).subscribe();
    }


  // getTestseries(id: any) {


  //   this.loading = true; // Start loading
   

  //   this.testSeriesService
  //     .getTestSeriesById(id)
  //     .pipe(
  //       tap((response) => {
  //         this.testSeriesDetails =  response.response
          
  //       }),
  //       catchError((error) => {
  //         console.error('Error:', error);
  //         return of(error); // Return an observable to handle the error
  //       }),
  //       finalize(() => {
          
        
  //         this.loading = false; // Stop loading
         
  //       })
  //     )
  //     .subscribe();
  // }


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
 


  getAllTests() {


    this.loading = true; // Start loading
   

    this.testSeriesService
      .getAllTest()
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

    this.GeneratedQuestions = [...this.AccordionData]
    // this.transformData();
 
  }

  DeleteCategory(id: any) {
    this.categoriesService
      .deleteCategory(id)
      .pipe(
        tap((response) => {
        }),
        catchError((error) => {
          console.error('Error deleting category:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.getCategories();
          this.getAllMappedCategories();
        })
      )
      .subscribe();
  }

  deleteTest(val: any) {
    this.testSeriesService
    .deleteTest(val.id)
    .pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error deleting test:', error);
        return of(error); // Return an observable to handle the error
      }),
      finalize(() => {
        this.getAllTests()
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

    if(targetElement.id !== 'dropdownCourseOpen') {
      this.dropdownCourseOpen = false;
    }

    if(targetElement.id !== 'dropdownLanguageOpen') {
      this.dropdownLanguageOpen = false;
    }
  }

}
