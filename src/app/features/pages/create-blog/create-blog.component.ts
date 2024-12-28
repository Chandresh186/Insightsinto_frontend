import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Quill from 'quill';
import { apiResponse, Category } from '../../../core/models/interface/categories.interface';
import { CategoriesService } from '../../../core/services/categories.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { BlogService } from '../../../core/services/blog.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-blog',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './create-blog.component.html',
  styleUrl: './create-blog.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateBlogComponent implements OnInit  {
  public blogData = {
    title: '',
    description: '',
    content: '',
    coverImage: [] as any[],
    tags: [] as string[],
  };

  public quillEditor: Quill | undefined;




  public dropdownOpen: boolean = false; // Controls dropdown visibility
   public selectedOption: Category | null = null; // Holds the selected option
   public searchQuery: string = ''; // Current search input value
   public categories: Category[] | null = [];  // To hold categories
   public filteredOptions: Category[] | null = []; // Filtered options for search

  //  public chipInput: string = '';
   public chips: Category[] = [];

   public loading = false; // To track loading state
   private errorMessage: string | null = null; // To store error messages


   constructor(private route : ActivatedRoute, private categoriesService: CategoriesService, private blogService : BlogService, private router: Router) {}

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
      this.chips.push(chipInput);
      // this.chipInput = ''; // Clear input
    // }
  }

  public removeChip(index: number): void {
    this.chips.splice(index, 1);
  }

  getBlogId() {
    return this.route.snapshot.params['id']
  }

  ngOnInit(): void {
    if(this.getBlogId()) {
      this.getBlogById(this.getBlogId())

    }
    this.getCategories();
    // Initialize Quill Editor
    this.quillEditor = new Quill('#editor', {
      theme: 'snow',
      placeholder: 'Write your blog content here...',
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
  }

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.blogData.coverImage = [input.files[0]];
    }
  }

  public checkIfHttpOrHttps(url: any): boolean {
    const regex = /^(http:\/\/|https:\/\/)/;
    return regex.test(url);
  }

  public onSubmit(form: any): void {
    if (!form.valid) return;

    // Retrieve blog content from Quill editor
    const blogContent = this.quillEditor?.root.innerHTML;

    // Combine form data
    const blogPost = {
      ...this.blogData,
      content: blogContent,
      tags: this.chips.map((q)=> q.id)
    };

   

    this.blogService
      .createBlog(blogPost)
      .pipe(
        tap((response) => {
         
          
        }),
        catchError((error) => {
          console.error('Error creating Blog:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
        

          this.loading = false; // Stop loading
          this.router.navigateByUrl('/dash/blogs')
        })
      )
      .subscribe();

    // Handle the blog submission logic (e.g., send it to an API)
  }


  onEditSubmit(form: any) : void {
    if (!form.valid) return;

    const blogContent = this.quillEditor?.root.innerHTML;

    // Combine form data
    const blogPost = {
      ...this.blogData,
      content: blogContent,
      tags: this.chips.map((q)=> q.id)
    };

     this.blogService
      .updateBlog(this.getBlogId() ,blogPost)
      .pipe(
        tap((response) => {
         
          
        }),
        catchError((error) => {
          console.error('Error updating Blog:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
        

          this.loading = false; // Stop loading
          this.router.navigateByUrl('/dash/blogs')
        })
      )
      .subscribe();


    
  }


  public setFilteration(categories: any) {
    this.filteredOptions = [...categories]; // Filtered options for search
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


    getBlogById(id: any) {
      this.loading = true;  // Set loading state to true while fetching data
      this.blogService.getBlogById(id).pipe(
        tap(response => {
          
            this.blogData.title = response.title;
            this.blogData.description = response.description;
            if (this.quillEditor && this.quillEditor.root) {
              this.quillEditor.root.innerHTML = response.blogContent;
            } 
            this.blogData.coverImage = response.coverImage

          this.chips = response.tags
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
  
    @HostListener('document:click', ['$event.target'])
    onClickOutside(targetElement: HTMLElement): void {
      if (targetElement.id !== 'dropdownOpen' ) {
        this.dropdownOpen = false;
      }
    }
}
