import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { CourseService } from '../../../core/services/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { PaymentService } from '../../../core/services/payment.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AsyncButtonComponent } from '../../../shared/resusable_components/async-button/async-button.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { patternValidator } from '../../../shared/helper.service';
import { validationErrorMessage } from '../../../core/constants/validation.constant';
import { loginRequest } from '../../../core/models/interface/login_request.interface';
import { registerRequest } from '../../../core/models/interface/register_request.interface';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-public-course-detail-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AsyncButtonComponent, FormsModule],
  templateUrl: './public-course-detail-page.component.html',
  styleUrl: './public-course-detail-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PublicCourseDetailPageComponent implements OnInit {
  private _userEmail: string = '';
  public otp: string = '';
  public loading = false;
  private errorMessage: string | null = null;
  public courseData : any;
  public staticBaseUrl : any = environment.staticBaseUrl
  public isSignUpAsyncCall: boolean = false;
  public isSignInAsyncCall: boolean = false;
  public hidePassword = true;
  public validationErrorMessage = validationErrorMessage;
  public signUpForm!: FormGroup;
  public loginForm!: FormGroup;
  public selectedTestSeries:any 
  private modalRef!: NgbModalRef;
  private confirmEmailmodalRef!: NgbModalRef;
  public isLogin: boolean = false;
  @ViewChild('content') content!: TemplateRef<any>; 
  @ViewChild('confirmmEmail') confirmmEmail!: TemplateRef<any>; 
  constructor(private authService: AuthService, private courseService : CourseService, private route : ActivatedRoute,private paymentService: PaymentService, private router : Router, private modalService: NgbModal, private toastr: ToastrService) {}

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
    this.getPublicCourseById(this.getCourseId())
  }

  get signUpControl() {
    return this.signUpForm.controls;
  }

  get loginFormControl() {
    return this.loginForm.controls;
  }

  getUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser?.response?.userId ?? null;
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

  getCourseId() {
    return this.route.snapshot.params['id']
  }

  getPublicCourseById(id: any) {
    this.loading = true;  // Set loading state to true while fetching data
      this.courseService.getPublicCourseById(id).pipe(
        tap(response => {
          console.log(response)
          this.courseData = response;
          
    
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


    // Getter for email
     getEmail(): any {
      return this._userEmail;
    }
  
    // Setter for email
     setEmail(value: any) {
      this._userEmail = value; // Update the form value
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
    
      this.authService.register(registerData).pipe(
        tap(registerResponse => {
          console.log(registerResponse)
          this.toastr.success("Please login and confim your email", "success", {
            progressBar: true
          }) ;
          if (!registerResponse || !registerResponse.status) {
            throw new Error('Invalid registration response. Registration failed.');
          }

          // localStorage.setItem('currentUser', JSON.stringify(registerResponse));
          const product = {
            userid: registerResponse.response.userId,
            productid: selectedTestSeries.id,
            moduleType: 'course'
          }
          localStorage.setItem('product', JSON.stringify(product))
          this.isLogin = true;
          // this.closeModal();
          // this.router.navigateByUrl(`/dash/payment/checkout/${registerResponse.response.userId}`); // Navigate to checkout
          // this.signUpForm.reset(); // Reset the form after successful registration
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
          this.toastr.error(error.error.message, "Error", {
            progressBar: true
          }) ;
          this.errorMessage = error.message || 'Something went wrong. Please try again.';
          console.error('Error during login or payment process:', error);
          if(error && error.error.status === false && error.error.message === "Please verify your email before logging in.") {
            // this.router.navigateByUrl(`/validate/${loginData.email}`)
            console.log("hello");
            const email =  this.loginForm.get('email')?.value;
            this.setEmail(email);
            this.resendMail();
            this.confirmEmailmodalRef = this.modalService.open(this.confirmmEmail,  { scrollable: true , ariaLabelledBy: 'confirm-email'});
          }
          return of(null);
        }),
        finalize(() => {
          this.isSignInAsyncCall = false;
          this.loading = false; // Reset loading state
        })
      ).subscribe();
    }



    onSubmit() {
      console.log('OTP Submitted: ', this.otp);
      const obj = {
        email: this.getEmail(),
        otp: this.otp
      };
  
      console.log(obj);
      this.loading = true; // Set loading state
      this.authService
        .validateOTP(obj)
        .pipe(
          tap((response) => {
            console.log(response);
            if(response.success) {
              console.log('Resending OTP...');
              this.toastr.success(response.message, "success", {
                progressBar: true
              }) ;
              
              // this.router.navigateByUrl('auth')
            }
          }),
          catchError((error) => {
            this.toastr.error(error.error.message, "Error", {
              progressBar: true
            }) ;
            this.errorMessage = 'validation failed. Please try again.'; // Handle error
            console.error('validation error:', error);
            return of(null); // Return a default value to continue the stream
          }),
          finalize(() => {
            this.otp = '';
            this.loading = false; // Reset loading state
            //  this.modalService.dismissAll();
            this.confirmEmailmodalRef.close();
          })
        )
        .subscribe();
    }
  
    resendMail() {
      const obj = {
        email: this.getEmail(),
      };
  
      console.log(obj);
      this.loading = true; // Set loading state
      this.authService
        .resendOTP(obj)
        .pipe(
          tap((response) => {
            console.log(response);
            if(response.success) {
              console.log('Resending OTP...');
            }
          }),
          catchError((error) => {
            this.errorMessage = 'Registration failed. Please try again.'; // Handle error
            console.error('Registration error:', error);
            return of(null); // Return a default value to continue the stream
          }),
          finalize(() => {
            this.otp = '';
            this.loading = false; // Reset loading state
            //  this.modalService.dismissAll();
          })
        )
        .subscribe();
    }

    isNumberKey(evt: any) {
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
      return true;
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
