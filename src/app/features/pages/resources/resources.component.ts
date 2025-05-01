import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  inject,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  Subject,
  tap,
} from 'rxjs';
import {
  apiResponse,
  Category,
  CategoryList,
} from '../../../core/models/interface/categories.interface';
import { CategoriesService } from '../../../core/services/categories.service';
import {
  NgbModal,
  NgbOffcanvas,
  NgbOffcanvasRef,
} from '@ng-bootstrap/ng-bootstrap';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Folder } from '../../../core/models/interface/folder.interface';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../core/services/auth.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DomSanitizer } from '@angular/platform-browser';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { PdfWatermarkService } from '../../../core/services/pdf-watermark.service';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import Swal from 'sweetalert2';
import { ToggleService } from '../../../core/services/toggle.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    ngbootstrapModule,
    NgxDocViewerModule,
  ],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ResourcesComponent implements OnInit {
  public staticBaseUrl = environment.staticBaseUrl;
  public pdfLink: any = '';
  public searchCatSubject: Subject<string> = new Subject<string>();
  public AllMappedCat: any[] = [];
  public loading = false; // To track loading state
  private errorMessage: string | null = null;
  public filteredOptions: Category[] | null = [];
  public searchCategory: string = '';
  // private offcanvasService = inject(NgbOffcanvas);
  dailyEditorialForm!: FormGroup;
  public dropdownOpen: boolean = false;
  selectedFile: File | null = null;
  public selectedOption: Category | any = null;
  public searchQuery: string = '';
  public categories: Category[] | null = [];
  private offcanvasRef!: NgbOffcanvasRef;
  selectedFolder: any = null;
  selectedFolderId: string | null = null;
  navigationStack: any[] = [];
  currentFolder: any = null;
  openCategoryIds = new Set<string>();
  private modalService = inject(NgbModal);
  _filteredCategories: any[] = [];
  public isFolderOpen: boolean = false;
  // filteredCategories: any = [];
  // Track breadcrumb items
  public breadcrumbItems: { id: string; name: string }[] = [];
  constructor(
    private toastr: ToastrService,
    private categoriesService: CategoriesService,
    private offcanvasService: NgbOffcanvas,
    private _authService: AuthService,
    public sanitizer: DomSanitizer,
    private pdfWatermarkService: PdfWatermarkService,
    private toggleService: ToggleService
  ) {
    this.searchCatSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query) => {
        this.searchCategory = query; // Assign the value to searchQuery

        // Expand matching items
        const result = this.setOpenByCondition(this.AllMappedCat, query);

        // Update openCategoryIds from isOpen flags
        this.openCategoryIds.clear();
        this.markOpenCategoryIds(result);

        // Update filtered data
        this._filteredCategories = result;
      });
  }

  openTop(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  openFolder(id: any) {
    this.isFolderOpen = true;
    this.toggleCategory(id);
  }

  onSearchChange(query: any) {
    console.log(query.target.value);
    this.searchCatSubject.next(query.target.value); // Emit the query to search
  }

  ngOnInit() {
    this.toggleService.toggle$.subscribe(value => {
      this.isFolderOpen = value;
    });

    this.getCategories();
    this.getAllMappedCategories();

    this.dailyEditorialForm = new FormGroup({
      fileName: new FormControl('', Validators.required),
      file: new FormControl(null), // File is required
    });
  }
  public checkRole(role: string): boolean {
    return this._authService.checkRole(role);
  }

  get dailyEditorialFormControl() {
    return this.dailyEditorialForm.controls;
  }

  getCategories(): void {
    this.loading = true; // Set loading state to true while fetching data
    this.categoriesService
      .getResourceCategories()
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

  deleteResource(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a1f35',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Store current folder ID before deletion
        this.loading = true; // Set loading state to true while fetching data
        const currentFolderId = this.currentFolder?.id;
        this.categoriesService
          .deleteResource(id)
          .pipe(
            tap((response) => {
              // After deletion, reload data but maintain current folder
              this.getAllMappedCategories();

              // Navigate back to the same folder after data reload
              if (currentFolderId) {
                setTimeout(() => {
                  this.navigateToFolder(currentFolderId);
                }, 100);
              }

              Swal.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success',
                confirmButtonColor: '#1a1f35',
              });
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
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectOption(option: Category): void {
    this.selectedOption = option; // Set the selected option
    this.dropdownOpen = false; // Close dropdown
    this.searchQuery = ''; // Reset search input
    this.filteredOptions = this.categories ? [...this.categories] : []; // Reset filtered list
  }

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

  deleteFromUploadList() {
    // const fileInput: any = document.getElementById('fileInput') as HTMLInputElement;
    // if (fileInput) {
    //   fileInput.value = ''; // Reset the input value
    // }
    // this.dailyEditorialForm.patchValue({ file: this.selectedFile });
    this.selectedFile = null;
    this.dailyEditorialForm.patchValue({ file: null });
  }

  isCategoryOpen(categoryId: string, categories?: any): boolean {
    // return !!this.openCategories.get(categoryId); // Get state (default false)
    // const category = this.filteredCategories.find((cat: any) => cat.id === categoryId);
    // return category ? category.isOpen || this.openCategories.has(categoryId) : false;

    // categories = categories || this.filteredCategories; // Start from root if no categories are passed

    // for (let category of categories) {
    //   if (category.id === categoryId) {
    //     return category.isOpen === true; // Return isOpen state
    //   }
    //   if (category.subCategories?.length) {
    //     if (this.isCategoryOpen(categoryId, category.subCategories)) {
    //       return true; // If any nested category is open, return true
    //     }
    //   }
    // }
    // return false; // Default to false if not found
    return this.openCategoryIds.has(categoryId);
  }

  // toggleCategory(categoryId: string, categories?: any) {

  //   categories = categories || this.filteredCategories; // Start from the root if no categories are passed

  //   for (let category of categories) {
  //     if (category.id === categoryId) {
  //       category.isOpen = !category.isOpen; // Toggle isOpen
  //       return;
  //     }
  //     if (category.subCategories?.length) {
  //       this.toggleCategory(categoryId, category.subCategories); // Recursively check subcategories
  //     }
  //   }
  // }

  // navigateToFolder(categoryId: string, categories?: any): boolean {
  //   categories = categories || this.AllMappedCat;

  //   for (let category of categories) {
  //     if (category.id === categoryId) {
  //       // Update breadcrumb
  //       this.updateBreadcrumbs(category);
  //       this.navigationStack.push(category);
  //       this.currentFolder = category;

  //       return true;
  //     }

  //     if (category.subCategories?.length) {
  //       const found = this.navigateToFolder(categoryId, category.subCategories);
  //       if (found) return true;
  //     }
  //   }

  //   return false;
  // }

  navigateToFolder(categoryId: string, categories?: any): boolean {
    categories = categories || this.AllMappedCat;

    for (let category of categories) {
      if (category.id === categoryId) {
        // Update breadcrumb
        // Find the full path to this category
        const path = this.findCategoryPath(categoryId, this.AllMappedCat);

        // // Expand in left panel
        // this.openCategoryIds.add(categoryId);

        // this.navigationStack.push(category);
        // this.currentFolder = category;
        // return true;

        if (path) {
          this.navigationStack = [...path];
          this.currentFolder = category;

          // // Set selectedFolderId to the DEEPEST category's ID
          // this.selectedFolderId = categoryId;

          // Update breadcrumbs
          this.breadcrumbItems = this.navigationStack.map((item) => ({
            id: item.id,
            name: item.catName,
          }));

          // Expand all parent categories in left panel
          for (let i = 0; i < this.navigationStack.length - 1; i++) {
            this.openCategoryIds.add(this.navigationStack[i].id);
          }
        }

        return true;
      }

      if (category.subCategories?.length) {
        const found = this.navigateToFolder(categoryId, category.subCategories);
        if (found) {
          // Expand parent in left panel
          this.openCategoryIds.add(category.id);
          return true;
        }
      }
    }

    return false;
  }

  // Update breadcrumbs when navigating
  // private updateBreadcrumbs(currentFolder: any): void {
  //   // If we're at the root, reset breadcrumbs
  //   if (this.navigationStack.length === 0) {
  //     const rootCategory = this.AllMappedCat.find(cat => cat.id === currentFolder.id);
  //     if (rootCategory) {
  //       this.breadcrumbItems = [{ id: rootCategory.id, name: rootCategory.catName }];
  //     }
  //     return;
  //   }

  //   // Rebuild breadcrumbs from navigation stack
  //   this.breadcrumbItems = this.navigationStack.map(item => ({
  //     id: item.id,
  //     name: item.catName
  //   }));

  //   // Add current folder if it's not already in the stack
  //   if (!this.navigationStack.some(item => item.id === currentFolder.id)) {
  //     this.breadcrumbItems.push({
  //       id: currentFolder.id,
  //       name: currentFolder.catName
  //     });
  //   }
  // }

  // private updateBreadcrumbs(currentFolder: any): void {
  //   // If we're navigating to a new folder that's not in the current path
  //   if (!this.navigationStack.some(item => item.id === currentFolder.id)) {
  //     // Rebuild breadcrumbs from navigation stack
  //     this.breadcrumbItems = this.navigationStack.map(item => ({
  //       id: item.id,
  //       name: item.catName
  //     }));

  //     // Add current folder
  //     this.breadcrumbItems.push({
  //       id: currentFolder.id,
  //       name: currentFolder.catName
  //     });
  //   } else {
  //     // If we're navigating within the current path (like going back)
  //     const itemIndex = this.navigationStack.findIndex(item => item.id === currentFolder.id);
  //     if (itemIndex >= 0) {
  //       this.breadcrumbItems = this.navigationStack.slice(0, itemIndex + 1).map(item => ({
  //         id: item.id,
  //         name: item.catName
  //       }));
  //     }
  //   }
  // }

  // Update goBack method to handle breadcrumbs
  // goBack(): void {
  //   if (this.navigationStack.length > 1) {
  //     this.navigationStack.pop(); // remove current folder
  //     this.currentFolder = this.navigationStack[this.navigationStack.length - 1]; // go to previous

  //     // Update breadcrumbs to reflect going back
  //     this.breadcrumbItems.pop();
  //   } else if (this.navigationStack.length === 1) {
  //     // Going back to root
  //     this.navigationStack = [];
  //     this.currentFolder = null;
  //     this.breadcrumbItems = [];
  //   }
  // }

  goBack(): void {
    if (this.navigationStack.length > 1) {
      this.navigationStack.pop(); // remove current folder
      this.currentFolder =
        this.navigationStack[this.navigationStack.length - 1]; // go to previous
      console.log(this.currentFolder);
      this.selectedFolderId = this.currentFolder.id;

      // Update breadcrumbs to reflect going back
      this.breadcrumbItems.pop();

      // Update left panel expansion
      this.openCategoryIds.delete(this.currentFolder.id);
    } else if (this.navigationStack.length === 1) {
      // Going back to root
      this.navigationStack = [];
      this.currentFolder = null;
      this.breadcrumbItems = [];
      this.openCategoryIds.clear();
    }
  }

  // Add method to navigate via breadcrumb
  // navigateViaBreadcrumb(itemId: string): void {
  //   // Find the index of the clicked breadcrumb item
  //   const itemIndex = this.breadcrumbItems.findIndex(item => item.id === itemId);

  //   if (itemIndex >= 0) {
  //     // Slice the breadcrumb items array up to the clicked item
  //     this.breadcrumbItems = this.breadcrumbItems.slice(0, itemIndex + 1);

  //     // Navigate to the folder
  //     this.navigateToFolder(itemId);
  //   }
  // }

  // Update the navigateViaBreadcrumb method
  navigateViaBreadcrumb(itemId: string): void {
    // Find the index of the clicked breadcrumb item
    const itemIndex = this.breadcrumbItems.findIndex(
      (item) => item.id === itemId
    );

    if (itemIndex >= 0) {
      // Reset navigation stack
      this.navigationStack = [];

      // Rebuild navigation stack up to the clicked item
      let currentLevel = this.AllMappedCat;
      const newStack: any = [];

      // Find the path to the clicked folder
      const findPath = (categories: any[], targetId: string): boolean => {
        for (const category of categories) {
          if (category.id === targetId) {
            newStack.push(category);
            return true;
          }

          if (category.subCategories?.length) {
            if (findPath(category.subCategories, targetId)) {
              newStack.push(category);
              return true;
            }
          }
        }
        return false;
      };

      // Find the path to the clicked item
      findPath(this.AllMappedCat, itemId);

      // Reverse to get the correct order (root to target)
      this.navigationStack = newStack.reverse();

      // Update current folder
      this.currentFolder =
        this.navigationStack[this.navigationStack.length - 1];
      this.selectedFolderId = this.currentFolder.id;

      // Update breadcrumbs to reflect the new path
      this.breadcrumbItems = this.navigationStack.map((item) => ({
        id: item.id,
        name: item.catName,
      }));

      // Ensure the folder is expanded in the left panel
      this.openCategoryIds.add(itemId);

      // Also expand all parent folders
      for (let i = 0; i < this.navigationStack.length - 1; i++) {
        this.openCategoryIds.add(this.navigationStack[i].id);
      }
    }
  }

  // goBack(): void {
  //   if (this.navigationStack.length > 1) {
  //     this.navigationStack.pop(); // remove current folder
  //     this.currentFolder = this.navigationStack[this.navigationStack.length - 1]; // go to previous
  //   }
  // }

  onLeftClick(categoryId: string) {
    // this.navigationStack = []; // reset stack
    // this.navigateToFolder(categoryId);

    // Find the full path to this category
    const path = this.findCategoryPath(categoryId, this.AllMappedCat);

    if (path) {
      this.navigationStack = [...path];
      this.currentFolder =
        this.navigationStack[this.navigationStack.length - 1];
      this.selectedFolderId = categoryId;

      // Update breadcrumbs
      this.breadcrumbItems = this.navigationStack.map((item) => ({
        id: item.id,
        name: item.catName,
      }));

      // Expand all parent categories in left panel
      for (let i = 0; i < this.navigationStack.length - 1; i++) {
        this.openCategoryIds.add(this.navigationStack[i].id);
      }
    }
  }

  // expandCategoryInTree(categoryId: string, categories?: any): boolean {
  //   categories = categories || this.AllMappedCat;

  //   for (let category of categories) {
  //     if (category.id === categoryId) {
  //       this.openCategoryIds.add(categoryId);
  //       return true;
  //     }

  //     if (category.subCategories?.length) {
  //       const found = this.expandCategoryInTree(categoryId, category.subCategories);
  //       if (found) {
  //         this.openCategoryIds.add(category.id); // Also expand the parent
  //         return true;
  //       }
  //     }
  //   }

  //   return false;
  // }

  expandCategoryInTree(categoryId: string, categories?: any): boolean {
    // First check if we need to expand or collapse
    const shouldExpand = !this.openCategoryIds.has(categoryId);

    const toggle = (id: string) => {
      shouldExpand
        ? this.openCategoryIds.add(id)
        : this.openCategoryIds.delete(id);
    };

    categories = categories || this.AllMappedCat;

    for (const category of categories) {
      if (category.id === categoryId) {
        toggle(categoryId);
        return true;
      }

      if (category.subCategories?.length) {
        const found = this.expandCategoryInTree(
          categoryId,
          category.subCategories
        );
        if (found) {
          // Only expand parent when expanding child
          if (shouldExpand) {
            this.openCategoryIds.add(category.id);
          }
          return true;
        }
      }
    }

    return false;
  }

  openViewDialog(content: TemplateRef<any>, item: any) {
    //  this.pdfLink = this.sanitizer.bypassSecurityTrustResourceUrl(link);
    console.log(item);
    this.pdfLink = {
      link: this.staticBaseUrl + item.url,
      name: item.title,
      type: item.type,
    };

    console.log(this.pdfLink);
    this.modalService
      .open(content, {
        centered: true,
        scrollable: true,
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          // this.closeResult.set(`Closed with: ${result}`);
        },
        (reason) => {
          // this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
        }
      );
  }

  // downloadPdf(): void {
  //   const link = document.createElement('a');
  //   link.href = this.pdfLink;
  //   link.download = this.getFileNameFromUrl(this.pdfLink);
  //   link.rel = 'noopener noreferrer';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

  getFileNameFromUrl(url: string): string {
    return url.substring(url.lastIndexOf('/') + 1);
  }

  async downloadFile(pdfLink: any): Promise<void> {
    const filePath = pdfLink.link;
    const fileName = pdfLink.name;
    const fileType = pdfLink.type?.toLowerCase();
    // console.log(filePath, fileName, fileType);
    try {
      // Fetch the original PDF (replace with your PDF path or bytes)

      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to fetch PDF:', response.statusText);
        return;
      }
      const fileBytes = await response.arrayBuffer();
      const userEmail = 'InsightsInto from knowlwdge to wisdom'.toUpperCase();

      if (fileType === 'pdf') {
        // // Check if the PDF is valid by checking the first few bytes for the PDF header
        // const pdfHeader = new TextDecoder().decode(fileBytes.slice(0, 5));
        // if (pdfHeader !== '%PDF-') {
        //   console.error('Invalid PDF file');
        //   return;
        // }

        // // Add watermark
        // const watermarkedPdf = await this.pdfWatermarkService.addWatermarkToPdf(
        //   new Uint8Array(fileBytes),
        //   userEmail
        // );

        // // Trigger download
        // const blob = new Blob([watermarkedPdf], { type: 'application/pdf' });
        // const link = document.createElement('a');
        // link.href = URL.createObjectURL(blob);
        // link.download = `${fileName}`; // This will prompt the browser to download the file with the filename in the URL
        // link.click();
        // URL.revokeObjectURL(URL.createObjectURL(blob));

        fetch(filePath)
          .then((response) => response.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.getFileNameFromUrl(filePath); // You can also use this.getFileNameFromUrl(filePath)
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          })
          .catch((error) => {
            console.error('Download failed:', error);
          });
      } else if (fileType === 'document') {
        // If you want to extract real text content, implement extraction logic here

        // const dummyContent = 'This is a placeholder content for DOCX file.';
        // const content = await this.pdfWatermarkService.extractContentFromDocx(
        //   new Uint8Array(fileBytes)
        // );
        // await this.pdfWatermarkService.createWatermarkedDocx(
        //   content,
        //   userEmail,
        //   fileName
        // );

        // const link = document.createElement('a');
        // link.href = filePath;
        // link.download = this.getFileNameFromUrl(filePath);
        // link.rel = 'noopener noreferrer';
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);

        fetch(filePath)
          .then((response) => response.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.getFileNameFromUrl(filePath); // You can also use this.getFileNameFromUrl(filePath)
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          })
          .catch((error) => {
            console.error('Download failed:', error);
          });
      } else {
        console.error('Unsupported file type:', fileType);
      }
    } catch (error) {
      console.error('Error during watermarking process:', error);
    }
  }

  toggleCategory(categoryId: string, categories?: any) {
    // categories = categories || this.filteredCategories;

    // for (let category of categories) {
    //   if (category.id === categoryId) {
    //     category.isOpen = !category.isOpen;

    //     // ✅ Set active folder
    //     this.selectedFolderId = category.id;
    //     this.selectedFolder = category;
    //     return true; // Exit once found
    //   }

    //   if (category.subCategories?.length) {
    //     const found = this.toggleCategory(categoryId, category.subCategories);
    //     if (found) return true;
    //   }
    // }

    // return false;

    if (this.openCategoryIds.has(categoryId)) {
      this.openCategoryIds.delete(categoryId);
    } else {
      this.openCategoryIds.add(categoryId);
    }

    // this.selectedFolderId = categoryId;
    // this.navigationStack = [];
    // this.navigateToFolder(categoryId);

    // Find the full path to this category
    const path = this.findCategoryPath(categoryId, this.AllMappedCat);

    if (path) {
      // Update navigation stack with the full path
      this.navigationStack = [...path];
      this.currentFolder =
        this.navigationStack[this.navigationStack.length - 1];
      this.selectedFolderId = categoryId;

      // Update breadcrumbs
      this.breadcrumbItems = this.navigationStack.map((item) => ({
        id: item.id,
        name: item.catName,
      }));

      // Expand all parent categories in left panel
      for (let i = 0; i < this.navigationStack.length - 1; i++) {
        this.openCategoryIds.add(this.navigationStack[i].id);
      }
    }
  }

  // Helper method to find the full path to a category
  private findCategoryPath(
    categoryId: string,
    categories: any[],
    currentPath: any[] = []
  ): any[] | null {
    for (const category of categories) {
      const newPath = [...currentPath, category];

      if (category.id === categoryId) {
        return newPath;
      }

      if (category.subCategories?.length) {
        const foundPath = this.findCategoryPath(
          categoryId,
          category.subCategories,
          newPath
        );
        if (foundPath) {
          return foundPath;
        }
      }
    }
    return null;
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
        // if (conditionFn(item)) {
        //   // Mark this item as open without altering its descendants
        //   return { ...item, isOpen: true };
        // }

        // Recursively check within subCategories
        // const updatedSubCategories = searchAndMarkAncestors(item.subCategories);

        const matched = conditionFn(item);
        const updatedSubCategories = item.subCategories
          ? searchAndMarkAncestors(item.subCategories)
          : [];

        const hasOpenSub = updatedSubCategories.some((sub: any) => sub.isOpen);

        // // If any subcategories are marked as open, mark this item as open (ancestor)
        // if (updatedSubCategories.some((sub: any) => sub.isOpen)) {
        //   return { ...item, isOpen: true, subCategories: updatedSubCategories };
        // }

        // Otherwise, return item with original subCategories
        return {
          ...item,
          isOpen: matched || hasOpenSub,
          subCategories: updatedSubCategories,
        };
      });
    }
    return searchAndMarkAncestors(data);
  }

  markOpenCategoryIds(categories: any[]): void {
    for (const cat of categories) {
      if (cat.isOpen) {
        this.openCategoryIds.add(cat.id);
      }
      if (cat.subCategories?.length) {
        this.markOpenCategoryIds(cat.subCategories);
      }
    }
  }

  get filteredCategories() {
    // const data = this.setOpenByCondition(this.AllMappedCat, (item:any) => item.catName.toLowerCase() === this.searchCategory.toLowerCase());
    // const data = this.setOpenByCondition(
    //   this.AllMappedCat,
    //   this.searchCategory
    // );

    // return data;

    // If no search has been made yet, return all categories without altering them
    if (!this.searchCategory?.trim()) {
      return this.AllMappedCat;
    }

    // Otherwise, return the filtered/expanded data
    return this._filteredCategories;
  }

  getAllMappedCategories(): void {
    this.loading = true; // Set loading state to true while fetching data
    // Store current folder ID before reloading
    const currentFolderId = this.currentFolder?.id;
    this.categoriesService
      .getallmappedResourceCategoriesContents()
      .pipe(
        tap((response) => {
          this.addIsOpenProperty(response);
          this.AllMappedCat = response; // Assign the fetched categories to the categories array
          this._filteredCategories = [...response];

          // if (response.length > 0) {
          //   if (!this.searchCategory?.trim()) {
          //     this._filteredCategories = [...response]; // Shallow copy to trigger binding if needed
          //   }

          //   // Only initialize navigation if we don't have a current folder
          //   if (!this.currentFolder) {
          //     const firstCategory = response[0];

          //     // Initialize navigation with full path
          //     const path = this.findCategoryPath(
          //       firstCategory.id,
          //       this.AllMappedCat
          //     );

          //     if (path) {
          //       this.navigationStack = [...path];
          //       this.currentFolder =
          //         this.navigationStack[this.navigationStack.length - 1];
          //       this.selectedFolderId = firstCategory.id;

          //       // Initialize breadcrumbs
          //       this.breadcrumbItems = this.navigationStack.map((item) => ({
          //         id: item.id,
          //         name: item.catName,
          //       }));

          //       // Expand all parent categories in left panel
          //       for (let i = 0; i < this.navigationStack.length - 1; i++) {
          //         this.openCategoryIds.add(this.navigationStack[i].id);
          //       }
          //     }
          //   }

          //   // this.selectedFolderId = firstCategory.id;
          //   // this.selectedFolder = firstCategory;
          //   // this.navigationStack = []; // Clear any previous navigation
          //   // // this.AllMappedCat = this.setOpenByCondition(response, firstCategory.catName);
          //   // this.navigateToFolder(firstCategory.id); // Show first folder in right panel
          // } else {
          //   this.selectedFolder = null;
          //   this.selectedFolderId = null;
          //   this.navigationStack = [];
          // }

          if (currentFolderId) {
            // Find and update the current folder from the new data
            const path = this.findCategoryPath(
              currentFolderId,
              this.AllMappedCat
            );
            if (path) {
              this.navigationStack = [...path];
              this.currentFolder =
                this.navigationStack[this.navigationStack.length - 1];
              this.selectedFolderId = currentFolderId;
              this.breadcrumbItems = this.navigationStack.map((item) => ({
                id: item.id,
                name: item.catName,
              }));

              // Rebuild open category IDs
              this.openCategoryIds.clear();
              for (let i = 0; i < this.navigationStack.length - 1; i++) {
                this.openCategoryIds.add(this.navigationStack[i].id);
              }
            }
          } else if (response.length > 0) {
            // Initialize with first category if no current folder
            const firstCategory = response[0];
            const path = this.findCategoryPath(
              firstCategory.id,
              this.AllMappedCat
            );
            if (path) {
              this.navigationStack = [...path];
              this.currentFolder =
                this.navigationStack[this.navigationStack.length - 1];
              this.selectedFolderId = firstCategory.id;
              this.breadcrumbItems = this.navigationStack.map((item) => ({
                id: item.id,
                name: item.catName,
              }));

              for (let i = 0; i < this.navigationStack.length - 1; i++) {
                this.openCategoryIds.add(this.navigationStack[i].id);
              }
            }
          }
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

  // selectFolder(folder: Folder) {
  //   this.clearActive(this.AllMappedCat);
  //   folder.isActive = true;
  //   this.selectedFolder = folder;
  // }

  // recursively clears active flags
  clearActive(folders: Folder[]) {
    for (const folder of folders) {
      folder.isActive = false;
      if (folder.subCategories.length > 0) {
        this.clearActive(folder.subCategories);
      }
    }
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

  // objectKeys(obj: any): string[] {
  //   return Object.keys(obj);
  // }

  public onFileChange(event: any): void {
    const files: any = Array.from(event.target.files); // Convert FileList to array

    if (files.length === 0) {
      alert('Please select a file.');
      return;
    }

    // If more than one file is selected, reset input and show alert
    if (files.length > 1) {
      alert('You can only upload one file at a time.');
      event.target.value = ''; // Reset the input field
      return;
    }

    for (const file of files) {
      const isPDF = file.type === 'application/pdf';
      const isDoc = file.type === 'application/msword';
      const isDocx =
        file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      // Ensure the selected file is either a PDF or DOC/DOCX
      if (!isPDF && !isDoc && !isDocx) {
        alert('Only PDF, DOC, or DOCX files are allowed.');
        event.target.value = ''; // Reset the input field
        return;
      }

      // Save the file
      this.selectedFile = file; // you can have a single selected file now
    }

    // Patch the file into the form
    this.dailyEditorialForm.patchValue({ file: this.selectedFile });

    // Reset input field to allow re-selection of same file
    event.target.value = '';
  }

  createResource() {
    console.log(this.selectedOption, this.selectedFile);
    // console.log(this.dailyEditorialForm.value)
    const reqBody: any = {
      CategoryId: this.selectedOption.id,
      File: this.dailyEditorialForm.get('file')?.value,
      FileName: this.dailyEditorialForm.get('fileName')?.value,
    };
    console.log(reqBody);

    this.loading = true; // Set loading state to true while fetching data

    this.categoriesService
      .uploadResource(reqBody)
      .pipe(
        tap((response: any) => {
          // Keep the current folder state
          const currentFolderId = this.currentFolder?.id;

          this.getAllMappedCategories();

          // After data reload, navigate back to the same folder
          if (currentFolderId) {
            setTimeout(() => {
              this.navigateToFolder(currentFolderId);
            }, 100);
          }
        }),
        catchError((error) => {
          this.errorMessage = 'Error creating Daily editorial.'; // Handle error message
          console.error('Error creating Daily editorial:', error);
          this.toastr.warning(error.error.errors, 'Warning', {
            progressBar: true,
          });
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          this.resetForm();

          this.closeOffcanvas();
        })
      )
      .subscribe();
  }

  closeOffcanvas() {
    this.offcanvasService.dismiss();
  }

  private resetFileControl(): void {
    this.dailyEditorialForm.get('file')?.setValue(null); // Clear the FormControl value

    // Reset the HTML file input element
    const fileInputElement = document.getElementById(
      'files'
    ) as HTMLInputElement;
    if (fileInputElement) {
      fileInputElement.value = ''; // Clear the file input
    }

    this.selectedFile = null;
  }

  resetForm(): void {
    this.selectedOption = null;
    this.dailyEditorialForm.reset(); // Reset the form controls
    this.resetFileControl(); // Reset the file input separately
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement): void {
    if (targetElement.id !== 'target_Dropdown') {
      this.dropdownOpen = false;
    }
  }
}
