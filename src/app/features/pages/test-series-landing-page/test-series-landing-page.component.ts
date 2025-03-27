import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TableComponent } from "../../../shared/resusable_components/table/table.component";
import { TestSeriesService } from '../../../core/services/test-series.service';
import { BehaviorSubject, catchError, finalize, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { testSeriesValidationErrorMessage, validationErrorMessage } from '../../../core/constants/validation.constant';
import { PaymentService } from '../../../core/services/payment.service';
import { Router, RouterLink } from '@angular/router';
import { patternValidator } from '../../../shared/helper.service';
import { registerRequest } from '../../../core/models/interface/register_request.interface';
import { AuthService } from '../../../core/services/auth.service';
import { AsyncButtonComponent } from '../../../shared/resusable_components/async-button/async-button.component';
import { PaymentOrder } from '../../../core/models/interface/payment.interface';
import { loginRequest } from '../../../core/models/interface/login_request.interface';
import { CourseService } from '../../../core/services/course.service';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { environment } from '../../../../environments/environment.development';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-test-series-landing-page',
  standalone: true,
  imports: [CommonModule, TableComponent, NgbDatepickerModule, ReactiveFormsModule, AsyncButtonComponent, CarouselModule, RouterLink],
  templateUrl: './test-series-landing-page.component.html',
  styleUrl: './test-series-landing-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TestSeriesLandingPageComponent implements OnInit{

  // Example table headers
  tableHeaders:any = [];
  staticBaseUrl : any = environment.staticBaseUrl

    // Example table data
    tableData:any = [];




    // Dynamic Actions Config
    actionsConfig = [
      { key: 'buy', label: 'Buy', class: 'btn-primary', visible: true },
    ];
  
  
   // Handle Action Event
   handleAction(event: { action: string; row: any }) {
    switch (event.action) {
      case 'buy':
        this.onBuy(event.row);
        break;
    
      default:
        console.error('Unknown action:', event.action);
    }
  }


  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  closeResult = '';
  @ViewChild('content') content!: TemplateRef<any>;  // Reference to the template
  
  public isSignUpAsyncCall: boolean = false;
  public isSignInAsyncCall: boolean = false;
  public signUpForm!: FormGroup;
  public loginForm!: FormGroup;
  public validationErrorMessage = validationErrorMessage;
  public hidePassword = true;
  public selectedTestSeries:any 
  private orderId: string = '';
  private modalRef!: NgbModalRef;
  public isLogin: boolean = false;
  public showColumns: any;
  @ViewChild('testSeries', { static: false }) testSeriesSection!: ElementRef; 

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      // 0: {
      //   items: 1
      // },
      // 400: {
      //   items: 2
      // },
      // 740: {
      //   items: 3
      // },
      // 940: {
      //   items: 4
      // }
      0: {
        items: 1, // Extra small screens (phones)
      },
      576: {
        items: 2, // Small screens (phones, landscape orientation)
      },
      768: {
        items: 3, // Medium screens (tablets)
      },
      992: {
        items: 4, // Large screens (desktops)
      },
      1200: {
        items: 5, // Extra large screens (wide desktops)
      },
      1400: {
        items: 6, // Ultra-wide screens
      },
    },
    nav: false,
    autoplay: true,
  }


  constructor(private courseService : CourseService, private authService: AuthService, private testSeriesService: TestSeriesService, private modalService: NgbModal, private paymentService: PaymentService, private router : Router, public settingsService: SettingsService) {}

  ngOnInit() {
    this.signUpForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.compose([Validators.required, patternValidator()])),
      userType: new FormControl('bdc6804c-3669-4463-92e2-876d06bb3fd2'),
    });

    this.loginForm =  new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.compose([Validators.required, patternValidator()])),
    });
  
    this.loadAllCourses();
    
    if(this.getUserId() !== null) {
      this.loadUserAllCourses(this.getUserId());
    }

  }

  getUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser?.response?.userId ?? null;
  }

  scrollToTestSeries() {
    this.testSeriesSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
}

 

  get signUpControl() {
    return this.signUpForm.controls;
  }

  get loginFormControl() {
    return this.loginForm.controls;
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
  
      // Add 'currency' pipe for 'fee' column
      if (key === 'fee') {
        pipe = 'currency';  // The pipe name for fee is currency
        pipeFormat = 'INR';  // No special formatting for 'currency' pipe
      } 
      // Add 'date' pipe for 'startDate' column
      else if (key === 'createdAt') {
        pipe = 'date';  // The pipe name for startDate is date
        pipeFormat = 'd MMM, y';  // Custom format for date (can be changed as needed)
      }
  
      return {
        key: key,
        displayName: formatDisplayName(key),
        pipe: pipe,
        pipeFormat: pipeFormat
      };
    });
  }


  onBuy(row: any) {
    this.selectedTestSeries = row;
    this.paymentService.setSelectedProductForCheckout(this.selectedTestSeries);
    

    if(this.getUserId()) {
      this.router.navigateByUrl(`/dash/payment/checkout/${this.getUserId()}`); 

    } else {
      this.modalRef = this.modalService.open(this.content,  { scrollable: true , ariaLabelledBy: 'buy-courses'});
    }

   
   
  }


  private loadUserAllCourses(userId: any): void {
    this.loading = true; // Set loading state to true while fetching data
  
    this.courseService.getAllUserCourses(userId).pipe(
      tap((response: any) => {
       
        const courseIds = response.map((item: any) => item.id);
        
        this.courseService.setCourses(courseIds);
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
      })
    ).subscribe();
  }




    // Reactive loading of test series
    private loadAllCourses(): void {
      this.loading = true; // Set loading state to true while fetching data
    
      this.courseService.getAllActiveCoursesForPublic(true).pipe(
        tap((response: any) => {

          const courses = this.courseService.getCourses();
          
          var filteredData = null;
          if(courses && courses.length > 0) {
           filteredData = response.filter((item : any) => !courses.includes(item.id));

          } else {
            filteredData = response
          }

          
          

          this.tableData = filteredData; // Assign the fetched data to the list
          this.showColumns  = this.generateTableHeaders(filteredData.map(({ id,courseMaterials,isActive,parentDetails,parentId,testDetails,testId,updatedAt,video, isOfflineTest, ...rest }: any) => rest));
          this.tableHeaders = this.generateTableHeaders(filteredData)


          // this.tableData = response; // Assign the fetched data to the list
          // this.showColumns  = this.generateTableHeaders(response.map(({ id,courseMaterials,isActive,parentDetails,parentId,testDetails,testId,updatedAt,video, ...rest }: any) => rest));
          // this.tableHeaders = this.generateTableHeaders(response)
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


  registerUser() {
    const registerData: registerRequest = this.signUpForm.value; // Extract form data
  
    this.isSignUpAsyncCall = true;
    this.loading = true; // Set loading state
  
    // Log selectedTestSeries to debug the issue
    const selectedTestSeries = this.paymentService.getSelectedProductForCheckout()
  
    if (!selectedTestSeries || !selectedTestSeries.fee) {
      console.error('Invalid test series data. Ensure the test series is selected and contains a valid amount.');
      this.errorMessage = 'Please select a valid test series before proceeding.';
      this.isSignUpAsyncCall = false;
      this.loading = false;
      return;
    }
  
    this.authService.registerAndLogin(registerData).pipe(
      tap(registerResponse => {
        if (!registerResponse || !registerResponse.status) {
          throw new Error('Invalid registration response. Registration failed.');
        }
        localStorage.setItem('currentUser', JSON.stringify(registerResponse));
        const product = {
          userid: registerResponse.response.userId,
          productid: selectedTestSeries.id,
          moduleType: 'course'
        }
        localStorage.setItem('product', JSON.stringify(product))
        this.closeModal();
        this.router.navigateByUrl(`/dash/payment/checkout/${registerResponse.response.userId}`); // Navigate to checkout
        this.signUpForm.reset(); // Reset the form after successful registration
      }),
      
      catchError(error => {
        this.errorMessage = error.message || 'Something went wrong. Please try again.';
        console.error('Error during registration or payment process:', error);
        return of(null);
      }),
      finalize(() => {
        this.isSignUpAsyncCall = false;
        this.loading = false; // Reset loading state
      })
    ).subscribe();
  }






  loginUser() {
    const loginData: loginRequest = this.loginForm.value; // Extract form data
    
    this.isSignInAsyncCall = true;
    this.loading = true; // Set loading state
  
    // Log selectedTestSeries to debug the issue (optional)
    const selectedTestSeries = this.paymentService.getSelectedProductForCheckout();
  
    if (!selectedTestSeries || !selectedTestSeries.fee) {
      console.error('Invalid test series data. Ensure the test series is selected and contains a valid amount.');
      this.errorMessage = 'Please select a valid test series before proceeding.';
      this.isSignInAsyncCall = false;
      this.loading = false;
      return;
    }
  
    this.authService.login(loginData).pipe(
      tap(loginResponse => {
        if (!loginResponse || !loginResponse.status) {
          throw new Error('Invalid login response. Login failed.');
        }
        // Handle successful login - you might want to save tokens, user data, etc.
        this.loginForm.reset();
        localStorage.setItem('currentUser', JSON.stringify(loginResponse));
          const product = {
            userid: loginResponse.response.userId,
            productid: selectedTestSeries.id,
            moduleType: 'course'
          };
          localStorage.setItem('product', JSON.stringify(product));
          this.closeModal();
          this.router.navigateByUrl(`/dash/payment/checkout/${loginResponse.response.userId}`); // Navigate to checkout
          this.loginForm.reset();
      }),
     
      catchError(error => {
        this.errorMessage = error.message || 'Something went wrong. Please try again.';
        console.error('Error during login or payment process:', error);
        return of(null);
      }),
      finalize(() => {
        this.isSignInAsyncCall = false;
        this.loading = false; // Reset loading state
      })
    ).subscribe();
  }
  
  


  dismissModal() {
    if (this.modalRef) {
      this.modalRef.dismiss(); // Dismiss the modal
    }
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close(); // Close the modal
    }
  }

}
