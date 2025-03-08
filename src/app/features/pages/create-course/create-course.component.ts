import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Category } from '../../../core/models/interface/categories.interface';
import { catchError, finalize, of, tap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { CourseService } from '../../../core/services/course.service';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { environment } from '../../../../environments/environment.development';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ngbootstrapModule, ngbootstrapModule],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.scss'
})
export class CreateCourseComponent implements OnInit {
public createCourseForm!: FormGroup;
public testDropdownOpen: boolean = false;
public chapterDropdownOpen: boolean = false
public searchQuery: string = '';
public testSelectedOption: any | null = null;
public chapterselectedOption: any | null = null;
public testChips: any[] = []; 
public chapterchips: any[] = []; 
public testFilteredOptions: any[] | null = [];
public chapterfilteredOptions: any[] | null = [];
public loading = false;
private errorMessage: string | null = null;

public allTests: any[] = []
public allCourses: any[] = []
public courseMaterial: any[] = []
public selectedCourseMaterialId: any
public isCourseMaterialSelected: boolean = false;
public baseUrl = environment.staticBaseUrl
public isCreateChapter: boolean = false;
public courseData: any;

selectedFiles: { pdf: File[]; // Array to store multiple PDF files 
  video: File | null| any;
  image: File | null| any;} = {
  pdf: [],
  video: null,
  image: null 
};

constructor(private route : ActivatedRoute, private testSeriesService: TestSeriesService, private courseService : CourseService, private router: Router, private modalService : NgbModal) {}

ngOnInit() {
  console.log(this.getCourseId())
  if(this.getCourseId()) {
    this.getCourseById(this.getCourseId())

    this.getCourseMaterialById(this.getCourseId())

  }


    this.createCourseForm = new FormGroup({
      
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        fee: new FormControl(''),
        active: new FormControl(false),
        isOfflineTest: new FormControl(false)
       
      })

      this.loadTests();
      this.loadAllCourses();
}

get createCourseFormControl() {
  return this.createCourseForm.controls;
}


getCourseId() {
  return this.route.snapshot.params['id']
}

 private getHeaders(): HttpHeaders {
        const token: string = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
        return new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        });
      }

public testToggleDropdown(): void {
  this.testDropdownOpen = !this.testDropdownOpen;
}

public chapterToggleDropdown(): void {
  this.chapterDropdownOpen = !this.chapterDropdownOpen;
}

public testRemoveChip(index: number): void {
  this.testChips.splice(index, 1);
}

public chapterremoveChip(index: number): void {
  this.chapterchips.splice(index, 1);
}

public testFilterOptions() {
      
  if (this.searchQuery.trim() && this.allTests && this.allTests.length > 0) {
    // Filter categories based on catName, case insensitive
    this.testFilteredOptions = this.allTests.filter(test =>
      test.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  } else {
    // If searchQuery is empty, reset to all categories
    this.testFilteredOptions = this.allTests ? [...this.allTests] : [];
  }
}

public chapterfilterOptions() {
      
  if (this.searchQuery.trim() && this.allCourses && this.allCourses.length > 0) {
    // Filter categories based on catName, case insensitive
    this.chapterfilteredOptions = this.allCourses.filter(courses =>
      courses.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  } else {
    // If searchQuery is empty, reset to all categories
    this.chapterfilteredOptions = this.allCourses ? [...this.allCourses] : [];
  }
}

public testSelectOption(option: any): void {
  this.testSelectedOption = option; // Set the selected option
  this.testAddChip(option)
  this.testDropdownOpen = false; // Close dropdown
  this.searchQuery = ''; // Reset search input
  this.testFilteredOptions = this.allTests ? [...this.allTests] : []; // Reset filtered list
  setTimeout(()=> {
    this.testSelectedOption = null;

  }, 1000)
}


public childrenSelectOption(option: any): void {
  this.chapterselectedOption = option; // Set the selected option
  this.chapteraddChip(option)
  this.chapterDropdownOpen = false; // Close dropdown
  this.searchQuery = ''; // Reset search input
  this.chapterfilteredOptions = this.allCourses ? [...this.allCourses] : []; // Reset filtered list
  setTimeout(()=> {
    this.chapterselectedOption = null;

  }, 1000)
}


public setTestFilteration(test: any) {
  this.testFilteredOptions = [...test]; // Filtered options for search
}

public setCourseFilteration(course: any) {
  this.chapterfilteredOptions = [...course]; // Filtered options for search
}

public testElementInChips(element: any): boolean {
  // return this.chips.includes(element);
  return this.testChips.some(chip => chip.id === element.id);
}

public chapterisElementInChips(element: any): boolean {
  // return this.chips.includes(element);
  return this.chapterchips.some(chip => chip.id === element.id);
}

public testAddChip(chipInput: any): void {
  // if (this.chipInput.trim()) {
    this.testChips[0]= chipInput;
    // this.chipInput = ''; // Clear input
  // }
}

public chapteraddChip(chipInput: any): void {
  // if (this.chipInput.trim()) {
    this.chapterchips[0] = chipInput ;
    // this.chipInput = ''; // Clear input
  // }
}




// public onFileChange(event: any): void {
//   const files: any = Array.from(event.target.files); // Convert the FileList to an array

//   if (files.length === 0) {
//     alert('Please select a file.');
//     return;
//   }

//    // If more than one file is selected, reset the input field and show alert
//    if (files.length > 1) {
//     alert('You can only upload one file at a time.');
//     event.target.value = ''; // Reset the input field
//     return;
//   }

//   // Loop through the files to ensure only one PDF and one video
//   for (const file of files ) {
//     const isPDF = file.type === 'application/pdf';
//     const isVideo = file.type.startsWith('video/');

//     // Ensure the selected file is either a PDF or a video
//     if (!isPDF && !isVideo) {
//       alert('Only PDF or video files are allowed.');
//       event.target.value = ''; // Reset the input field
//       return;
//     }

//     // If the selected file is PDF and a PDF has already been uploaded
//     if (isPDF && this.selectedFiles['pdf']) {
//       alert('You can only upload one PDF file.');
//       event.target.value = ''; // Reset the input field
//       return;
//     }

//     // If the selected file is video and a video has already been uploaded
//     if (isVideo && this.selectedFiles['video']) {
//       alert('You can only upload one video file.');
//       event.target.value = ''; // Reset the input field
//       return;
//     }

//     // Add the file to the appropriate key in the selectedFiles object
//     if (isPDF) {
//       this.selectedFiles['pdf'] = file;
      
//     } else if (isVideo) {
//       this.selectedFiles['video'] = file;
//     }
//   }
//   // this.dailyEditorialForm.patchValue({ pdf: this.selectedFiles['pdf'], video: this.selectedFiles['video']  });
//   event.target.value = ''
// }



public onFileChange(event: any): void {
  const files: File[] = Array.from(event.target.files); // Convert the FileList to an array
  console.log(files)

  if (files.length === 0) {
    alert('Please select a file.');
    return;
  }

  for (const file of files) {
    const isPDF = file.type === 'application/pdf';
    const isImg = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    // Ensure the selected file is either a PDF or a video
    if (!isPDF && !isVideo && !isImg) {
      alert('Only PDF or video or image files are allowed.');
      event.target.value = ''; // Reset the input field
      return;
    }

    // If the selected file is a video and a video has already been uploaded
    if (isVideo && this.selectedFiles['video']) {
      alert('You can only upload one video file.');
      event.target.value = ''; // Reset the input field
      return;
    }

    // If the selected file is an image and an image has already been uploaded
    if (isImg && this.selectedFiles['image']) {
      alert('You can only upload one image file.');
      event.target.value = ''; // Reset the input field
      return;
    }

    // Add the file to the appropriate key in the selectedFiles object
    if (isPDF) {
      // If it's a PDF, allow multiple uploads
      if (!this.selectedFiles['pdf']) {
        this.selectedFiles['pdf'] = []; // Initialize as an array for multiple PDFs
      }
      this.selectedFiles['pdf'].push(file); // Add the PDF to the array
    } else if (isVideo) {
      this.selectedFiles['video'] = file; // Assign the video
    } else if (isImg) {
      this.selectedFiles['image'] = file; // Assign the image (single image allowed)
    }
  }

  // Optionally, reset the file input to allow re-uploading the same file
  event.target.value = '';
}



public onCourseMaterialFileChange(event: any): void {
  const files: File[] = Array.from(event.target.files); // Convert the FileList to an array

  if (files.length === 0) {
    alert('Please select a file.');
    return;
  }

  // Check if selectedCourseMaterialId and getCourseId() are equal
  const canUploadMultiple = this.selectedCourseMaterialId === this.getCourseId();
  console.log(canUploadMultiple)

  for (const file of files) {
    const isPDF = file.type === 'application/pdf'; // Check if the file is a PDF

    // Ensure the selected file is a PDF
    if (!isPDF) {
      alert('Only PDF files are allowed.');
      event.target.value = ''; // Reset the input field
      return;
    }
    

    // If the selected file is a PDF and PDFs are already uploaded
    if (!canUploadMultiple && this.selectedFiles['pdf'] && this.selectedFiles['pdf'].length >= 1) {
      alert('You can only upload one PDF file.');
      event.target.value = ''; // Reset the input field
      return;
    }

    // Add the PDF to the selectedFiles object
    if (!this.selectedFiles['pdf']) {
      this.selectedFiles['pdf'] = []; // Initialize as an array for multiple PDFs
    }
    this.selectedFiles['pdf'].push(file); // Add the PDF to the array
  }

  // Optionally, reset the file input to allow re-uploading the same file
  event.target.value = '';
}






objectKeys(obj: any): string[] {
  return Object.keys(obj);
}


// deleteFromUploadList(k: any, val:any) {
//   const fileInput: any = document.getElementById('fileInput') as HTMLInputElement;
//   if (fileInput) {
//     fileInput.value = ''; // Reset the input value
//   }
//   this.selectedFiles[k] = null
//   // this.dailyEditorialForm.patchValue({[k]: null})
// }


// deleteFromUploadList(k: string, val: File): void {
//   const fileInput: HTMLInputElement | null = document.getElementById('fileInput') as HTMLInputElement;
  
//   if (fileInput) {
//     fileInput.value = ''; // Reset the input field value
//   }

//   // If the key corresponds to 'pdf' and it is an array
//   if (k === 'pdf') {
//     // Remove the file from the pdf array
//     this.selectedFiles[k] = this.selectedFiles[k].filter(file => file !== val);
//   } else if (k === 'video') {
//     // If the key is 'video', set it to null
//     this.selectedFiles[k] = null;
//   }

//   // Optionally, if using a reactive form, update the form value
//   // this.dailyEditorialForm.patchValue({[k]: null}); // Uncomment if needed
// }
 extractFilename(filePath : any) {
  // Use split to get the last part of the path
  return filePath.split('/').pop();
}

deleteFromUploadList(k: 'pdf' | 'video' | 'image', val: File | null): void {
  if (val === null) return; // Early return if the file is null

  // Handle file deletion from selectedFiles
  if (k === 'pdf') {
    this.selectedFiles[k] = this.selectedFiles[k].filter(file => file !== val); // Remove specific PDF file
  } else if (k === 'video') {
    this.selectedFiles[k] = null; // Reset video to null
  } else if (k === 'image') {
    this.selectedFiles[k] = null;
  }
}


onSubmit(val: any) {
  // console.log(Object.values(this.selectedFiles).flat())
  // console.log(this.testChips)
  // console.log(this.chapterchips)
  console.log(val);

  const obj = {
    Name: val.name,
    Files: Object.values(this.selectedFiles).flat().filter(item => item !== null),
    TestId: this.testChips.length > 0 ? this.testChips[0].id : null,
    ParentId: this.chapterchips.length > 0 ? this.chapterchips[0].id : null,
    Fee: val.fee ?? null,
    Description: val.description,
    IsActive: val.active,
    IsOfflineTest: val.isOfflineTest 
  }
  console.log(obj)

  this.loading = true; // Set loading state to true while fetching data

  this.courseService.createCourse(obj).pipe(
    tap((response: any) => {
      console.log(response)
     
      
    }),
    catchError((error) => {
      this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
      console.error('Error loading Daily editorials:', error);
      
      return of([]); // Return an empty array in case of an error
    }),
    finalize(() => {
      this.loading = false; // Reset loading state when the request is completed
      this.router.navigateByUrl('/dash/course-list')
    })
  ).subscribe();
}

onEditSubmit(val: any) {
  console.log(val)

  const obj = {
    Name: val.name,
    Files: Object.values(this.selectedFiles).flat().filter(item => item !== null),
    TestId:  this.testChips.length > 0 ? this.testChips[0].id : null,
    ParentId: this.chapterchips.length > 0 ? this.chapterchips[0].id : null,
    Fee: val.fee ?? null,
    Description: val.description,
    IsActive: val.active,
    IsOfflineTest: val.isOfflineTest 
  }
  console.log(obj)

  this.loading = true; // Set loading state to true while fetching data

  this.courseService.editCourse(this.getCourseId(),obj).pipe(
    tap((response: any) => {
      console.log(response)
     
      
    }),
    catchError((error) => {
      this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
      console.error('Error loading Daily editorials:', error);
      
      return of([]); // Return an empty array in case of an error
    }),
    finalize(() => {
      this.loading = false; // Reset loading state when the request is completed
      this.router.navigateByUrl('/dash/course-list')
    })
  ).subscribe();
}

getCourseById(id: any) {
  this.loading = true;  // Set loading state to true while fetching data
  this.courseService.getCourseById(id).pipe(
    tap(response => {
      console.log(response)
      this.courseData = response;
      if(response.parentId !== null) {
          this.isCreateChapter = true;
      }
      this.createCourseForm.get('name')?.setValue(response.name);
      this.createCourseForm.get('description')?.setValue(response.description);
      this.createCourseForm.get('fee')?.setValue(response.fee);
      this.createCourseForm.get('active')?.setValue(response.isActive)
      this.createCourseForm.get('isOfflineTest')?.setValue(response.isOfflineTest)
      this.testChips = response.testDetails !== null ?  [response.testDetails] : []
      if(response.parentDetails !== null) {
        this.chapterchips = response.parentDetails !== null ? [response.parentDetails] : []
      }
      if(response.video !== null) {
        this.courseService.getVideo(this.baseUrl+response.video).subscribe((res) => {
          this.selectedFiles.video = res 
          
        })
      }

      if(response.thumbnail !== null) {
        this.courseService.getVideo(this.baseUrl+response.thumbnail).subscribe((res) => {
          this.selectedFiles.image = res 
          
        })
      }

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


getCourseMaterialById(id: any) {
  this.loading = true;  // Set loading state to true while fetching data
  this.courseService.getCourseMaterialById(id).pipe(
    tap(response => {
      console.log(response)
      this.courseMaterial = response
      // this.createCourseForm.get('name')?.setValue(response.name);
      // this.createCourseForm.get('description')?.setValue(response.description);
      // this.createCourseForm.get('fee')?.setValue(response.fee);
      // this.testSerieschips = [response.testSeriesDetails]
      // if(response.parentDetails !== null) {
      //   this.chapterchips = [response.parentDetails]
      // }
      // this.courseService.getVideo(this.baseUrl+response.video).subscribe((res) => {
      //   this.selectedFiles.video = res 
        
      // })

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

onEditMaterial(val:any) {
  console.log(val)
   this.selectedCourseMaterialId = val.id
   this.isCourseMaterialSelected = true;
  const obj = {
    Id: val.id,
    Files: ''
  }
  console.log(obj)
  // this.loading = true;  // Set loading state to true while fetching data
  // this.courseService.updateCourseMaterial(obj).pipe(
  //   tap(response => {
  //     console.log(response)
  //     this.courseMaterial = response
  //     // this.createCourseForm.get('name')?.setValue(response.name);
  //     // this.createCourseForm.get('description')?.setValue(response.description);
  //     // this.createCourseForm.get('fee')?.setValue(response.fee);
  //     // this.testSerieschips = [response.testSeriesDetails]
  //     // if(response.parentDetails !== null) {
  //     //   this.chapterchips = [response.parentDetails]
  //     // }
  //     // this.courseService.getVideo(this.baseUrl+response.video).subscribe((res) => {
  //     //   this.selectedFiles.video = res 
        
  //     // })

  //   }),
  //   catchError(error => {
  //     this.errorMessage = 'Failed to load categories.';
  //     console.error('Error fetching categories:', error);
  //     return of([]);  // Return an empty array if there's an error
  //   }),
  //   finalize(() => {
  //     this.loading = false;  // Reset loading state when the request is completed
  //   })
  // ).subscribe();
}

submitEdit() {


  const obj = {
    Id: this.selectedCourseMaterialId,
    Files: this.selectedFiles.pdf
  }
  console.log(obj)

  this.loading = true;  // Set loading state to true while fetching data
  this.courseService.updateCourseMaterial(obj).pipe(
    tap(response => {
      console.log(response)
      // this.courseMaterial = response
      // this.createCourseForm.get('name')?.setValue(response.name);
      // this.createCourseForm.get('description')?.setValue(response.description);
      // this.createCourseForm.get('fee')?.setValue(response.fee);
      // this.testSerieschips = [response.testSeriesDetails]
      // if(response.parentDetails !== null) {
      //   this.chapterchips = [response.parentDetails]
      // }
      // this.courseService.getVideo(this.baseUrl+response.video).subscribe((res) => {
      //   this.selectedFiles.video = res 
        
      // })

    }),
    catchError(error => {
      this.errorMessage = 'Failed to load categories.';
      console.error('Error fetching categories:', error);
      return of([]);  // Return an empty array if there's an error
    }),
    finalize(() => {
      this.loading = false;  // Reset loading state when the request is completed
      this.getCourseMaterialById(this.getCourseId())
      this.isCourseMaterialSelected = false;
      this.selectedFiles.pdf = []

    })
  ).subscribe();
}

open(content: TemplateRef<any>) {
  this.modalService.open(content, { ariaLabelledBy: 'course-material' , scrollable: true }).result.then(
    (result) => {
      this.selectedCourseMaterialId = ''
      this.isCourseMaterialSelected = false;
    },
    (reason) => {
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.selectedCourseMaterialId = ''
      this.isCourseMaterialSelected = false;
    },
  );;
}

onDeleteMaterial(val:any) {
  console.log(val) 

  this.loading = true;  // Set loading state to true while fetching data
  this.courseService.deleteCourseMaterial(val.id).pipe(
    tap(response => {
      console.log(response)
      // this.courseMaterial = response
      // this.createCourseForm.get('name')?.setValue(response.name);
      // this.createCourseForm.get('description')?.setValue(response.description);
      // this.createCourseForm.get('fee')?.setValue(response.fee);
      // this.testSerieschips = [response.testSeriesDetails]
      // if(response.parentDetails !== null) {
      //   this.chapterchips = [response.parentDetails]
      // }
      // this.courseService.getVideo(this.baseUrl+response.video).subscribe((res) => {
      //   this.selectedFiles.video = res 
        
      // })

    }),
    catchError(error => {
      this.errorMessage = 'Failed to load categories.';
      console.error('Error fetching categories:', error);
      return of([]);  // Return an empty array if there's an error
    }),
    finalize(() => {
      this.loading = false;  // Reset loading state when the request is completed
      this.getCourseMaterialById(this.getCourseId())
    })
  ).subscribe();
}





private loadTests(): void {
  this.loading = true; // Set loading state to true while fetching data
 
  this.testSeriesService.getAllTest().pipe(
    tap((res: any) => {
      console.log(res)
      this.allTests =  res;
      
      this.setTestFilteration(this.allTests)
      // this.tableData = response.response; // Assign the fetched data to the list
      
      // this.showColumns  = this.generateTableHeaders(response.response.map(({ id, ...rest }: any) => rest));
      // this.tableHeaders = this.generateTableHeaders(response.response)
      
    }),
    catchError((error) => {
      this.errorMessage = 'Error loading test series.'; // Handle error message
      console.error('Error loading test series:', error);
      return of([]); // Return an empty array in case of an error
    }),
    finalize(() => {
      this.loading = false; // Reset loading state when the request is completed
    })
  ).subscribe();
}


private loadAllCourses(): void {
  this.loading = true; // Set loading state to true while fetching data

  this.courseService.getAllCourses().pipe(
    tap((response: any) => {
      console.log(response)
      this.allCourses = response
      this.setCourseFilteration(this.allCourses)
      
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


 @HostListener('document:click', ['$event.target'])
 onClickOutside(targetElement : HTMLElement): void {

    if (targetElement.id !== 'chapterDropdownOpen') {
      this.chapterDropdownOpen = false;
    }
    if (targetElement.id !== 'testDropdownOpen') {
      this.testDropdownOpen = false;
    }
  }

   
}
