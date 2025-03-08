import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { testSeriesValidationErrorMessage } from '../../../core/constants/validation.constant';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  catchError,
  debounceTime,
  finalize,
  of,
  Subject,
  Subscription,
  tap,
} from 'rxjs';
import {
  apiResponse,
  Category,
  CategoryList,
} from '../../../core/models/interface/categories.interface';
import { CategoriesService } from '../../../core/services/categories.service';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { PdfGeneratorService } from '../../../core/services/pdf-generator.service';
import { PdfWatermarkService } from '../../../core/services/pdf-watermark.service';
import { SharedDataService } from '../../../shared/helper.service';
// import { CountdownTimerService } from '../../../core/services/count-down-timer.service';

@Component({
  selector: 'app-user-testseries-details',
  standalone: true,
  imports: [CommonModule, ngbootstrapModule, RouterModule],
  templateUrl: './user-testseries-details.component.html',
  styleUrl: './user-testseries-details.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserTestseriesDetailsComponent implements OnInit {
  public testSeriesDetails: any;
  public testResultDetails: any;
  public testData: any = [];
  public loading = false; // To track loading state
  public selectedTest : any;

  private startTime!: number; // Time when countdown started
  private countdownMinutes!: number; // Total countdown time in minutes
  private timerId: any; // Reference for setInterval
  // private errorMessage: string | null = null; // To store error messages

  @ViewChild('Result') Result!: TemplateRef<any>;
  private modalRef!: NgbModalRef; //

  constructor(
    private testSeriesService: TestSeriesService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private pdfService: PdfGeneratorService,
    private pdfWatermarkService: PdfWatermarkService,
    private sharedDataService: SharedDataService
    // private countdownTimerService: CountdownTimerService
  ) {}

  ngOnInit(): void {
    const testSeriesId = this.getTestSeriesId();
    this.getTestseries(testSeriesId);
    this.getTestsByTestSeries(testSeriesId);
          //  // Subscribe to each card's remaining time from the service
          //  this.testData.forEach((card: any) => {
          
          //   const remainingTime$ = this.countdownTimerService.getRemainingTime(card.id);
          //   if (remainingTime$) {
          //     remainingTime$.subscribe((remainingTime) => {
          //       card.remainingTime = remainingTime;
          //     });
          //   }
          // });

   
  }

  getTestSeriesId() {
    return this.route.snapshot.params['id'];
  }

  getUserId() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null').response
      .userId;
  }


  // startCountdown(cardId: number, minutes: number): void {
  //   this.countdownTimerService.startCountdown(cardId, minutes);
  //   //  Subscribe to each card's remaining time from the service
  //    this.testData.forEach((card: any) => {
  //     const remainingTime$ = this.countdownTimerService.getRemainingTime(card.id);
  //     if (remainingTime$) {
  //       remainingTime$.subscribe((remainingTime) => {
  //         card.remainingTime = remainingTime;
  //       });
  //     }
  //   });
  // }

  goToAnalysis(testId:any) {
    this.router.navigateByUrl(`/dash/result-analysis/${testId}`);
    this.closeModal();
    // [routerLink]="['/dash/result-analysis', testResultDetails && testResultDetails.testId]"
  }


  onlineStart(val: any) {
    const payload = {
      userId: this.getUserId(),
      testSeriesId: this.getTestSeriesId(),
      testId: val.id,
    };

    this.loading = true; // Start loading

    this.testSeriesService
      .startOnlineTest(payload)
      .pipe(
        tap((response) => {
          this.testSeriesDetails = response.response;
          this.closeModal();
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.loading = false; // Stop loading

          this.router.navigateByUrl(
            `dash/test/${val.id}/${this.getTestSeriesId()}`
          );
        })
      )
      .subscribe();
  }

  offlineStart(val: any) {
    
    const payload = {
      userId: this.getUserId(),
      testSeriesId: this.getTestSeriesId(),
      testId: val.id,
      status: val.status
    };

    this.loading = true; // Start loading

    this.testSeriesService
      .startOfflineTest(payload)
      .pipe(
        tap((res) => {
      
        

          const headerVal = {
            institutionName: "K-ASOFTECH",
            paperName: "Economics",
            totalMarks: "100",
            time: "2 Hours"
          }

          //  this.pdfService.generatePDF(res, headerVal).then(async pdfBytes => {
          //     // Add watermark
          //     const watermarkedPdf = await this.pdfWatermarkService.addWatermarkToPdf(
          //       new Uint8Array(pdfBytes),
          //       JSON.parse(localStorage.getItem('currentUser') as string)?.response.email.toUpperCase()
          //     );
            
          //     // Trigger download
          //     const blob = new Blob([watermarkedPdf], { type: 'application/pdf' });
          //     const link = document.createElement('a');
          //     link.href = URL.createObjectURL(blob);
          //     link.download = `${val.title}.pdf`; // This will prompt the browser to download the file with the filename in the URL
          //     link.click();
           
          // });

          const obj = {
             headerVal : {
              institutionName: "K-ASOFTECH",
              paperName: "Economics",
              totalMarks: "100",
              time: "2 Hours"
            },

            questionPaper : res
          }

          this.sharedDataService.changeData(obj)

        
          // this.startCountdown(val.id)

          this.closeModal();


        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.loading = false; // Stop loading
          // this.getTestsByTestSeries(this.getTestSeriesId());
          this.router.navigateByUrl(
            `dash/test-offline/${val.id}/${this.getTestSeriesId()}`
          );

       
        })
      )
      .subscribe();
  }

  seeResult(val: any) {

    this.modalRef = this.modalService.open(this.Result, {
      // size: 'lg',
      windowClass: 'custom-modal-container',
      scrollable: true,
      ariaLabelledBy: 'modal-basic-title',
    });

    this.getResultById(val.id);
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close(); // Close the modal
    }
  }

  getTestseries(id: any) {
    this.loading = true; // Start loading

    this.testSeriesService
      .getTestSeriesById(id)
      .pipe(
        tap((response) => {
          this.testSeriesDetails = response.response;
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

  getResultById(testId: any) {
    this.loading = true; // Start loading

    this.testSeriesService
      .getTestResultById(testId, this.getUserId())
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
  }

  getTestsByTestSeries(TestSeriesId: any) {
    this.loading = true; // Start loading

    this.testSeriesService
      .getUserTestByTestSeries(TestSeriesId, this.getUserId())
      .pipe(
        tap((response) => {
          this.testData = response.map(
            ({
              keywords,
              files,
              topics,
              categories,
              ...rest
            }: any) => rest

            
          ); // Assign the fetched data to the list

    
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


  onFileSelected(e: any) {
    console.log("hello there !", e)
  }



  openInstuctionModel(content: TemplateRef<any>, test: any) {

		this.modalRef =this.modalService.open(content, { size: 'xl', scrollable: true })
    // .result.then(
		// 	(result) => {
    //     this.selectedTest = '';
		// 	},
		// 	(reason) => {
    //     this.selectedTest = '';
		// 	},
		// );
    
    this.selectedTest  = test;
	}
}
