import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { apiResponse, Category } from '../../../core/models/interface/categories.interface';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, finalize, of, tap } from 'rxjs';
import { CategoriesService } from '../../../core/services/categories.service';
import Quill from 'quill';
import { QuestionService } from '../../../core/services/question.service';

@Component({
  selector: 'app-create-question',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-question.component.html',
  styleUrl: './create-question.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateQuestionComponent {
  public dropdownOpen: boolean = false;
  public searchQuery: string = '';
  public filteredOptions: Category[] | null = [];
  public categories: Category[] | null = []; 
  public selectedOption: Category | null = null;
  public chips: Category[] = []; 

  public questionForm!: FormGroup

  public quillEditor: Quill[] | undefined;


  public loading = false; // To track loading state
   private errorMessage: string | null = null; // To store error messages



  constructor(private route : ActivatedRoute,  private categoriesService: CategoriesService, private questionServcie : QuestionService,  private router: Router) {}

  ngOnInit() {
    this.questionForm = new FormGroup({
      question: new FormControl(''),
      optionA: new FormControl(''),
      optionB: new FormControl(''),
      optionC: new FormControl(''),
      optionD: new FormControl(''),
      ans: new FormControl(''),
      complexity: new FormControl(''),
      categoryId: new FormControl(''),
      description: new FormControl('')
    })

    if(this.getQuestionId()) {
      console.log("yes")
      this.getQuestionById(this.getQuestionId())
 
    } else {
      console.log("no")
    }

    this.getCategories();
    this.initilizeEditor();
  }

  initilizeEditor() {
     // Initialize Quill Editor
     const editors = [{id: '#questionEditor', placeholder: 'Write question content here...'}, {id:'#optionAEditor', placeholder: 'Write option A content here...'}, {id:'#optionBEditor', placeholder: 'Write option B content here...'}, {id:'#optionCEditor', placeholder: 'Write option C content here...'}, {id:'#optionDEditor', placeholder: 'Write option D content here...'}]
     this.quillEditor =  editors.map((obj) => {
      return  new Quill(obj.id, {
        theme: 'snow',
        placeholder: obj.placeholder,
        modules: {
          toolbar: [
            // Font family
            [{ font: [] }],
  
            // Font size
            [{ size: [] }],
  
            // Text formatting
            ['bold', 'italic', 'underline', 'strike'], // Bold, italic, underline, strike
            [{ script: 'sub' }, { script: 'super' }], // Subscript, superscript
            [{ color: [] }, { background: [] }], // Text and background colors
  
            // Headers and block styles
            [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers (H1-H6)
            ['blockquote', 'code-block'], // Blockquote and code block
  
            // Lists and Indentation
            [{ list: 'ordered' }, { list: 'bullet' }], // Ordered and unordered lists
            [{ indent: '-1' }, { indent: '+1' }], // Indentation
  
            // Alignment and Direction
            [{ align: [] }], // Align left, center, right, justify
            [{ direction: 'rtl' }], // RTL text direction
  
            // Links, media, and more
            ['link', 'image', 'video', 'formula'], // Links, images, videos, formulas
  
            ['table'], // Table operations
  
            // Clear formatting
            ['clean'], // Clear formatting
          ],
          table: true, // Enable table module
        },
      });

     })
  }

   public toggleDropdown(): void {
      this.dropdownOpen = !this.dropdownOpen;
    }
  
    public filterOptions() {
      
      if (this.searchQuery.trim() && this.categories && this.categories.length > 0) {
        // Filter categories based on catName, case insensitive
        this.filteredOptions = this.categories.filter(category =>
          category.catName.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      } else {
        // If searchQuery is empty, reset to all categories
        this.filteredOptions = this.categories ? [...this.categories] : [];
      }
    }
  
    public selectOption(option: Category): void {
      this.selectedOption = option; // Set the selected option
      this.addChip(option)
      this.dropdownOpen = false; // Close dropdown
      this.searchQuery = ''; // Reset search input
      this.filteredOptions = this.categories ? [...this.categories] : []; // Reset filtered list
      setTimeout(()=> {
        this.selectedOption = null;
  
      }, 1000)
    }
  
    public addChip(chipInput: any): void {
      // if (this.chipInput.trim()) {
        this.chips[0]= chipInput;
        // this.chipInput = ''; // Clear input
      // }
    }
  
    public removeChip(index: number): void {
      this.chips.splice(index, 1);
    }
  
    getQuestionId() {
      return this.route.snapshot.params['id']
    }

    public isElementInChips(element: Category): boolean {
      // return this.chips.includes(element);
      return this.chips.some(chip => chip.id === element.id);
    }


     public getCategories(): void {
          this.loading = true;  // Set loading state to true while fetching data
          this.categoriesService.getCategories().pipe(
            tap(response => {
              var res: apiResponse = response;
              this.categories = res.response;  // Assign the fetched categories to the categories array
              this.setFilteration(this.categories)
            }),
            catchError(error => {
              this.errorMessage = 'Failed to load categories.';
              console.error('Error fetching categories:', error);
              return of([]);  // Return an empty array if there's an error
            }),
            finalize(() => {
              this.loading = false;  // Reset loading state when the request is completed
            })
          ).subscribe();
        }


        public setFilteration(categories: any) {
          this.filteredOptions = [...categories]; // Filtered options for search
        }


        getQuestionById(id: any) {
          this.loading = true;  // Set loading state to true while fetching data
          this.questionServcie.getQuestionById(id).pipe(
            tap(response => {
              console.log(response)
              this.questionForm.setValue({
                question: 'What is Angular?',
                optionA: 'A framework',
                optionB: 'A library',
                optionC: 'A database',
                optionD: 'An OS',
                ans: response.ans,
                complexity: response.complexity,
                categoryId: '123',
                description: 'A question about Angular framework'
              });
              
              if (this.quillEditor && this.quillEditor.length > 0) {
                this.quillEditor[0].root.innerHTML = response.question;
                this.quillEditor[1].root.innerHTML = response.a;
                this.quillEditor[2].root.innerHTML = response.b;
                this.quillEditor[3].root.innerHTML = response.c;
                this.quillEditor[4].root.innerHTML = response.d;
            
        
              }
                const obj = {
                  id: response.categoryId,
                  catName: response.categoryName,
                  parentCatId: null
              }
              
              this.chips = [obj]
            }),
            catchError(error => {
              this.errorMessage = 'Failed to load categories.';
              console.error('Error fetching categories:', error);
              return of([]);  // Return an empty array if there's an error
            }),
            finalize(() => {
              this.loading = false;  // Reset loading state when the request is completed
            })
          ).subscribe();
        }


    onEditSubmit(val: any) {
      console.log(val)
      const payload = {
        question: "" ,
        a: "",
        b: "",
        c: "",
        d: "",
        ans: this.questionForm.get('ans')?.value,
        complexity: this.questionForm.get('complexity')?.value,
        categoryId: this.chips[0].id,
        description: this.questionForm.get('description')?.value
      }
      if (this.quillEditor && this.quillEditor.length > 0) {
        payload.question = this.quillEditor[0].root.innerHTML;
        payload.a = this.quillEditor[1].root.innerHTML;
        payload.b = this.quillEditor[2].root.innerHTML;
        payload.c = this.quillEditor[3].root.innerHTML;
        payload.d = this.quillEditor[4].root.innerHTML;
    

      }
      console.log(payload)
      
      this.loading = true; // Set loading state to true while fetching data
      this.questionServcie.updateQuestion(this.getQuestionId(),payload).pipe(
        tap((response: any) => {
          console.log(response)
         
        }),
        catchError((error) => {
          this.errorMessage = 'Error updating questions.'; // Handle error message
          console.error('Error updating questions:', error);
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          this.router.navigateByUrl('/dash/question-list')
        })
      ).subscribe();
    }

    onSubmit(val:any) {
      const payload = {
        question: "" ,
        a: "",
        b: "",
        c: "",
        d: "",
        ans: this.questionForm.get('ans')?.value,
        complexity: this.questionForm.get('complexity')?.value,
        categoryId: this.chips[0].id,
        description: this.questionForm.get('description')?.value
      }
      if (this.quillEditor && this.quillEditor.length > 0) {
        payload.question = this.quillEditor[0].root.innerHTML;
        payload.a = this.quillEditor[1].root.innerHTML;
        payload.b = this.quillEditor[2].root.innerHTML;
        payload.c = this.quillEditor[3].root.innerHTML;
        payload.d = this.quillEditor[4].root.innerHTML;
    

      }
      console.log(payload)


      this.loading = true; // Set loading state to true while fetching data
      this.questionServcie.createQuestion(payload).pipe(
        tap((response: any) => {
          console.log(response)
         
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading questions.'; // Handle error message
          console.error('Error loading questions:', error);
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          this.router.navigateByUrl('/dash/question-list')
        })
      ).subscribe();
      
    }

 @HostListener('document:click', ['$event.target'])
    onClickOutside(targetElement: HTMLElement): void {
      // console.log(targetElement)
      if (targetElement.id !== 'dropdownOpen' ) {
        this.dropdownOpen = false;
      }
    }
   

    
}
