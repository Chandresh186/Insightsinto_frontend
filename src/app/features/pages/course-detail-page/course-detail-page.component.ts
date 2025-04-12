import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  catchError,
  finalize,
  interval,
  of,
  Subscription,
  take,
  tap,
} from 'rxjs';
import { CourseService } from '../../../core/services/course.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { VideoPlayerComponent } from '../../../shared/resusable_components/video-player/video-player.component';
import { AuthService } from '../../../core/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PdfWatermarkService } from '../../../core/services/pdf-watermark.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { ToastrService } from 'ngx-toastr';
import { UserTestAnswerSheetService } from '../../../core/services/user-test-answer-sheet.service';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-course-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    VideoPlayerComponent,
    RouterLink,
    PdfViewerModule,
    ngbootstrapModule,
  ],
  templateUrl: './course-detail-page.component.html',
  styleUrl: './course-detail-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CourseDetailPageComponent implements OnInit {
  public loading = false;
  private errorMessage: string | null = null;
  public allChapters: any = [];
  isScrolled: boolean = false;
  public activeChapter: any;
  public staticBaseUrl = environment.staticBaseUrl;

  public courseMaterial: any;
  public courseDetails: any;

  public showPdf: boolean = false;
  public pdfLink: any = '';

  totalTimeInMinutes!: number; // Total test time in minutes
  remainingTime!: string;

  private totalTimeInSeconds: number = 0; // Total test time in seconds
  private timerSubscription: Subscription | null = null;
  uploadedFiles: File[] = [];
  allSubmittedAnswerSheet: any[] = [];
  public testResultDetails: any;

  constructor(
    private router: Router,
    private testSeriesService: TestSeriesService,
    private userTestAnswerSheetService: UserTestAnswerSheetService,
    private toastr: ToastrService,
    private pdfWatermarkService: PdfWatermarkService,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private cdr: ChangeDetectorRef,
    private _authService: AuthService,
    private modalService: NgbModal,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadAllChapters(this.getCourseId());
  }

  public checkRole(role: string): boolean {
    return this._authService.checkRole(role);
  }
  getCourseId() {
    return this.route.snapshot.params['id'];
  }

  private loadAllChapters(id: any): void {
    this.loading = true; // Set loading state to true while fetching data

    this.courseService
      .getAllCourseChaptersById(id)
      .pipe(
        tap((response: any) => {
          console.log(response);
          this.allChapters = response;
          this.activeChapter = response[0];
          this.cdr.detectChanges();
          // console.log(this.activeChapter)
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
          console.error('Error loading Daily editorials:', error);
          this.allChapters = [];
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
        })
      )
      .subscribe();
  }

  setActiveChatpter(chapter: any) {
    // console.log(chapter)
    this.activeChapter = chapter;
    this.cdr.detectChanges();
  }

  onDelete(id: any) {
    console.log(id);

    this.loading = true; // Set loading state to true while fetching data

    this.courseService
      .deleteCourse(id)
      .pipe(
        tap((response: any) => {
          console.log(response);
          // this.allCourses = response
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
          console.error('Error loading Daily editorials:', error);
          // this.allCourses = [];
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          this.loadAllChapters(this.getCourseId());
        })
      )
      .subscribe();
  }

  openPlayer(link: any) {
    const modalRef = this.modalService.open(VideoPlayerComponent);
    modalRef.componentInstance.link = this.staticBaseUrl + link;
  }

  open(content: TemplateRef<any>, material: any) {
    console.log(material);
    this.courseMaterial = material;
    this.modalService.open(content, {
      scrollable: true,
      ariaLabelledBy: 'course-material',
    }).result.then(
      (result) => {
				// this.closeResult.set(`Closed with: ${result}`);
			},
			(reason) => {
				// this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
        this.showPdf = false;
			},
    );
  }

  openTest(content: TemplateRef<any>, courseDetail: any) {

    this.loading = true; // Set loading state to true while fetching data

    this.userTestAnswerSheetService
      .getAllAnswerSheetByChaptersId(courseDetail.id)
      .pipe(
        tap((response: any) => {
          console.log(response);
          this.allSubmittedAnswerSheet = response;
        }),
        catchError((error) => {
          this.errorMessage = 'Error uploading user test paper.'; // Handle error message
          console.error('Error uploading user test paper:', error);

          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          
        })
      )
      .subscribe();

    console.log(courseDetail);
    this.courseDetails = courseDetail;

    if(this.courseDetails.testDetails !== null) {
      const timer = this.convertTimeToRemainingFormat(
        this.courseDetails.testDetails.duration
      );
      this.totalTimeInMinutes = timer.totalTimeInMinutes; // Total test time in minutes
      this.remainingTime = timer.remainingTime; // Remaining time in mm:ss format
      this.startTestTimer();

    }
    this.modalService.open(content, {
      scrollable: true,
      ariaLabelledBy: 'test-modal',
      backdrop: 'static',
      keyboard: false,
    });
  }

  openSumitedTestList(content: TemplateRef<any>, id: any) {

    this.loading = true; // Set loading state to true while fetching data

    this.userTestAnswerSheetService
      .getAllAnswerSheetByChaptersId(id)
      .pipe(
        tap((response: any) => {
          console.log(response);
          this.allSubmittedAnswerSheet = response;
        }),
        catchError((error) => {
          this.errorMessage = 'Error uploading user test paper.'; // Handle error message
          console.error('Error uploading user test paper:', error);

          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          
        })
      )
      .subscribe();

     
        this.modalService.open(content, {
          scrollable: true,
          ariaLabelledBy: 'submitted-test-list',
        });
      
  
  }

  seeResult(content: TemplateRef<any>, val: any) {

    this.loading = true; // Start loading

    this.testSeriesService
      .getTestResultById(val.testId, this.getUser().userId)
      .pipe(
        tap((response) => {

          this.testResultDetails = response;
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

    this.modalService.open(content, {
      // size: 'lg',
      windowClass: 'custom-modal-container',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title',
    });

    // this.getResultById(val.id);
  }

  goToAnalysis(id: any) {
    this.router.navigateByUrl(`/dash/result-analysis/${id}`);
    this.modalService.dismissAll();
  }




  // onlineStart(val: any) {
  //   const payload = {
  //     userId: this.getUserId(),
  //     testSeriesId: this.getTestSeriesId(),
  //     testId: val.id,
  //   };

  //   this.loading = true; // Start loading

  //   this.testSeriesService
  //     .startOnlineTest(payload)
  //     .pipe(
  //       tap((response) => {
  //         // this.testSeriesDetails = response.response;
  //         // this.closeModal();
  //       }),
  //       catchError((error) => {
  //         console.error('Error:', error);
  //         return of(error); // Return an observable to handle the error
  //       }),
  //       finalize(() => {
  //         this.loading = false; // Stop loading

  //         this.router.navigateByUrl(
  //           `dash/test/${val.id}/${this.getTestSeriesId()}`
  //         );
  //       })
  //     )
  //     .subscribe();
  // }




  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // this.uploadedFiles.push(file); // Add the file to the array
      // Convert the file to a Uint8Array
      this.convertFileToUint8Array(file)
        .then(async (uint8Array: any) => {
          const watermarkedPdf =
            await this.pdfWatermarkService.addWatermarkToPdf(
              new Uint8Array(uint8Array),
              JSON.parse(
                localStorage.getItem('currentUser') as string
              )?.response.email.toUpperCase()
            );

          const blob = new Blob([watermarkedPdf], { type: 'application/pdf' });
          console.log(URL.createObjectURL(blob));
          const watermarkedFile = new File([blob], file.name, {
            type: 'application/pdf',
          });

          this.uploadedFiles.push(watermarkedFile); // Add the Uint8Array to the array
        })
        .catch((error) => {
          console.error('Error converting file to Uint8Array', error);
        });
    }
    // Reset the file input to allow re-selecting the same file
    event.target.value = '';
  }

  // Function to convert a file to a Uint8Array
  convertFileToUint8Array(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Set up the onload callback
      reader.onload = (event: any) => {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer); // Convert ArrayBuffer to Uint8Array
        resolve(uint8Array);
      };

      // Set up the onerror callback
      reader.onerror = function (event) {
        reject(new Error('File reading error'));
      };

      // Read the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    });
  }

  // Delete file from the list
  deleteFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  cancelTest(): void {
    const confirmation = window.confirm(
      'Are you sure you want to cancel the test?'
    );
    if (confirmation) {
      // Close the modal here
      this.modalService.dismissAll(); // Assuming you're using NgbModal
    }
  }

  convertTimeToRemainingFormat(duration: string): {
    totalTimeInMinutes: number;
    remainingTime: string;
  } {
    // Extract the number of minutes from the input string
    const minutes = parseInt(duration.replace('min', '').trim(), 10);

    if (isNaN(minutes) || minutes < 0) {
      throw new Error(
        "Invalid duration format. Expected format: 'XX min' or duration must be a non-negative number."
      );
    }

    // Calculate total time in minutes
    const totalTimeInMinutes = minutes;

    // Convert to mm:ss format (no hours, only minutes and seconds)
    const remainingTime = `${String(minutes).padStart(2, '0')}:00`;

    return { totalTimeInMinutes, remainingTime };
  }

  startTestTimer(): void {
    console.log('entered');
    // Convert total time to seconds
    this.totalTimeInSeconds = this.totalTimeInMinutes * 60;

    // Create an RxJS interval that emits every second
    this.timerSubscription = interval(1000)
      .pipe(take(this.totalTimeInSeconds)) // Emit values only for the test duration
      .subscribe({
        next: () => {
          this.totalTimeInSeconds--;
          this.remainingTime = this.formatTime(this.totalTimeInSeconds);

          // Trigger alerts at specific times
          if (this.totalTimeInSeconds === 600) {
            this.toastr.warning('10 minutes left!.');
          } else if (this.totalTimeInSeconds === 300) {
            this.toastr.warning('5 minutes left!.');
          } else if (this.totalTimeInSeconds === 60) {
            this.toastr.warning('1 minutes left!.');
          }

          if (this.totalTimeInSeconds === 0) {
            this.onTestComplete();
          }
        },
        error: (err) => console.error(err),
        complete: () => {},
      });
  }

  clearTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }

  onTestComplete(): void {
    alert("Time's up! Submitting the test...");
    // this.submitTest();
  }

  getUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null').response;
  }

  extractFilename(filePath : any) {
    // Use split to get the last part of the path
    return filePath.split('/').pop();
  }

  uploadTestPaper() {
    const Obj = {
      UserId: this.getUser().userId,
      UserName: this.getUser().firstName + ' ' + this.getUser().lastName,
      UserEmail: this.getUser().email,
      Sheet: this.uploadedFiles,
      TestId: null,
      CourseId: this.courseDetails.id,
    };

    console.log(Obj);
    this.loading = true; // Set loading state to true while fetching data

    this.userTestAnswerSheetService
      .uploadTestPaper(Obj)
      .pipe(
        tap((response: any) => {
          console.log(response);
        }),
        catchError((error) => {
          this.errorMessage = 'Error uploading user test paper.'; // Handle error message
          console.error('Error uploading user test paper:', error);

          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          this.modalService.dismissAll();
          this.uploadedFiles = [];
        })
      )
      .subscribe();
  }

  async downloadFile(filePath: string, fileName: string): Promise<void> {
    console.log(fileName);
    try {
      // Fetch the original PDF (replace with your PDF path or bytes)

      const response = await fetch(this.staticBaseUrl + filePath);
      if (!response.ok) {
        console.error('Failed to fetch PDF:', response.statusText);
        return;
      }
      const pdfBytes = await response.arrayBuffer();

      // Check if the PDF is valid by checking the first few bytes for the PDF header
      const pdfHeader = new TextDecoder().decode(pdfBytes.slice(0, 5));
      if (pdfHeader !== '%PDF-') {
        console.error('Invalid PDF file');
        return;
      }

      // Add watermark
      const watermarkedPdf = await this.pdfWatermarkService.addWatermarkToPdf(
        new Uint8Array(pdfBytes),
        JSON.parse(
          localStorage.getItem('currentUser') as string
        )?.response.email.toUpperCase()
      );

      // Trigger download
      const blob = new Blob([watermarkedPdf], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.pdf`; // This will prompt the browser to download the file with the filename in the URL
      link.click();
    } catch (error) {
      console.error('Error during watermarking process:', error);
    }
  }
}
