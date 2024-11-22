import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, OnInit, TemplateRef, viewChild, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { CategoriesService } from '../../../core/services/categories.service';
import { catchError, debounceTime, finalize, of, Subject, tap } from 'rxjs';
import { apiResponse, Category, CategoryList } from '../../../core/models/interface/categories.interface';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ngbootstrapModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CategoriesComponent implements OnInit {
  public chips: string[] = [];
  public chipInput: string = '';

  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public categories: Category[] | null = [];  // To hold categories

  public isCreateNewCategory: boolean = true;

  public AllMappedCat: CategoryList[] =  []


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
  // public categorytobeMoved : any


  @ViewChild('content') content!: TemplateRef<any>;  // Reference to the template
  @ViewChild('changeParent') changeParent!: TemplateRef<any>
  private modalRef!: NgbModalRef;

  constructor(private elementRef: ElementRef, private categoriesService: CategoriesService, private modalService: NgbModal) {
    this.searchCatSubject.pipe(debounceTime(300)).subscribe((query) => {
      this.searchCategory = query; // Assign the value to searchQuery
    });
  }


  ngOnInit() {
    this.getCategories();
    this.getAllMappedCategories();

    this.categoryForm = new FormGroup({
      id : new FormControl(''),
      catName: new FormControl(''), // You can set a default value here
      parentCatId: new FormControl('')
    });
  }

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
  

    selectOption(option: Category): void {
      this.selectedOption = option; // Set the selected option
      console.log(this.selectedOption)
      this.dropdownOpen = false; // Close dropdown
      this.searchQuery = ''; // Reset search input
      this.filteredOptions = this.categories ? [...this.categories] : []; // Reset filtered list
    }

    mapParentId(option: Category) : void {
      this.categoryForm.get('parentCatId')?.patchValue(option.id)
      this.selectedOption = option; // Set the selected option
      console.log(this.selectedOption)
      this.dropdownOpen = false; // Close dropdown
      this.searchQuery = ''; // Reset search input
      this.filteredOptions = this.categories ? [...this.categories] : []; // Reset filtered list
    }



    onEdit(val:any) {
      console.log(val)
    
      this.categoryForm.patchValue({
        id: val.id,
        catName: val.catName,
        parentCatId: val.parentCatId
      });
      this.modalRef = this.modalService.open(this.content,  { scrollable: true , ariaLabelledBy: 'modal-basic-title'});
      // e.stopPropagation();
    }



    onMove(val:any) {
      console.log(val)
      // this.categorytobeMoved = val
      this.categoryForm.patchValue({
        id: val.id,
        catName: val.catName,
        parentCatId: val.parentCatId
      });
      this.modalRef = this.modalService.open(this.changeParent,  { scrollable: false , ariaLabelledBy: 'modal-basic-title'});
     
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
      searchWords.some(word => item.catName.toLowerCase().includes(word));

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
    const data = this.setOpenByCondition(this.AllMappedCat, this.searchCategory)
    // console.log(data, this.searchCategory)
    return data;
  }



      // Method to get all categories (GET)
  getCategories(): void {
    this.loading = true;  // Set loading state to true while fetching data
    this.categoriesService.getCategories().pipe(
      tap(response => {
        console.log('Categories fetched successfully:', response);
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


  getAllMappedCategories(): void {
    this.loading = true;  // Set loading state to true while fetching data
    this.categoriesService.getallmappedCategories().pipe(
      tap(response => {
        console.log('Categories fetched successfully:', response);
        
        this.addIsOpenProperty(response);
        this.AllMappedCat = response;  // Assign the fetched categories to the categories array
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


  addIsOpenProperty(categories:any) {
    categories.forEach((category:any) => {
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
      "id": this.selectedOption?.id,
      "catNames": this.chips
    }
    this.loading = true; // Start loading

    this.categoriesService.createCategory(reqBody)
      .pipe(
        tap(response => {
          console.log('Category created successfully:', response);

        }),
        catchError(error => {
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
      "catNames": this.chips
    }
    this.loading = true; // Start loading

    this.categoriesService.createCategory(reqBody)
      .pipe(
        tap(response => {
          console.log('Category created successfully:', response);

        }),
        catchError(error => {
          console.error('Error creating category:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.loading = false; // Stop loading
          console.log('Category creation request completed.');
          this.selectedOption = null;
          this.chips = [];
          this.getCategories();
          this.getAllMappedCategories()

        })
      )
      .subscribe();
  }


  EditCategory() {
    const reqBody = [this.categoryForm.value];

    console.log(reqBody)
    this.loading = true; // Start loading
    this.categoryAsyncCall = true;

    this.categoriesService.updateCategory(this.categoryForm.value.id , reqBody)
      .pipe(
        tap(response => {
          console.log('Category updated successfully:', response);

        }),
        catchError(error => {
          console.error('Error updating category:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.categoryForm.reset();
          this.closeModal();
          this.selectedOption = null;
          this.loading = false; // Stop loading
          this.categoryAsyncCall = false;
          console.log('Category updation request completed.');
          this.getCategories();
          this.getAllMappedCategories();

        })
      )
      .subscribe();
  }
 

  DeleteCategory(id:any) {
  
    this.categoriesService.deleteCategory(id)
      .pipe(
        tap(response => {
          console.log('Category deleted successfully:', response);

        }),
        catchError(error => {
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


  closeModal() {
    if (this.modalRef) {
      this.modalRef.close(); // Close the modal
    }
  }




// Detect clicks outside the component to close the dropdown
  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement): void {
  
    if (targetElement.id !== 'target_Dropdown' ) {
      this.dropdownOpen = false;
    }
  }
}
