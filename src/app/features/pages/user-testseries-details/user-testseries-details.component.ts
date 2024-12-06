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
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-user-testseries-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-testseries-details.component.html',
  styleUrl: './user-testseries-details.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserTestseriesDetailsComponent implements OnInit {
  public testSeriesDetails: any;
  public testResultDetails: any;
  public testData: any = [];
  public loading = false; // To track loading state
  // private errorMessage: string | null = null; // To store error messages

  @ViewChild('Result') Result!: TemplateRef<any>;
  private modalRef!: NgbModalRef;

  constructor(
    private testSeriesService: TestSeriesService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const testSeriesId = this.getTestSeriesId();
    this.getTestseries(testSeriesId);
    this.getTestsByTestSeries(testSeriesId);
  }

  getTestSeriesId() {
    return this.route.snapshot.params['id'];
  }

  getUserId() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null').response
      .userId;
  }

  onStart(val: any) {
    // console.log(val)
    const payload = {
      userId: this.getUserId(),
      testSeriesId: this.getTestSeriesId(),
      testId: val.id,
    };
    console.log(payload);

    this.loading = true; // Start loading

    this.testSeriesService
      .startTest(payload)
      .pipe(
        tap((response) => {
          console.log(' successfull:', response);
          this.testSeriesDetails = response.response;
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          this.loading = false; // Stop loading

          console.log('completed.');
          this.router.navigateByUrl(
            `dash/test/${val.id}/${this.getTestSeriesId()}`
          );
        })
      )
      .subscribe();
  }

  seeResult(val: any) {
    console.log(val);

    this.modalRef = this.modalService.open(this.Result, {
      // size: 'sm',
      windowClass: 'custom-modal-container',
      scrollable: false,
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
          console.log(' successfull:', response);
          this.testSeriesDetails = response.response;
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

  getResultById(testId: any) {
    this.loading = true; // Start loading

    this.testSeriesService
      .getTestResultById(testId, this.getUserId())
      .pipe(
        tap((response) => {
          console.log(' successfull:', response);
          this.testResultDetails = response;
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

  getTestsByTestSeries(TestSeriesId: any) {
    this.loading = true; // Start loading

    this.testSeriesService
      .getUserTestByTestSeries(TestSeriesId, this.getUserId())
      .pipe(
        tap((response) => {
          console.log('successfull:', response);
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

          console.log('completed.');
        })
      )
      .subscribe();
  }
}
