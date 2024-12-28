import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, TemplateRef, ViewChild } from '@angular/core';
import { EditorialService } from '../../../core/services/editorial.service';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbCollapseModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { AsyncButtonComponent } from '../../../shared/resusable_components/async-button/async-button.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { validationErrorMessage } from '../../../core/constants/validation.constant';
import { patternValidator } from '../../../shared/helper.service';
import { AuthService } from '../../../core/services/auth.service';
import { registerRequest } from '../../../core/models/interface/register_request.interface';
import { PaymentOrder } from '../../../core/models/interface/payment.interface';
import { loginRequest } from '../../../core/models/interface/login_request.interface';

@Component({
  selector: 'app-daily-editorial-landing-page',
  standalone: true,
  imports: [PdfViewerModule, CommonModule, NgbCollapseModule, AsyncButtonComponent, ReactiveFormsModule],
  templateUrl: './daily-editorial-landing-page.component.html',
  styleUrl: './daily-editorial-landing-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DailyEditorialLandingPageComponent  {
  public loading = false;
  public allEditoril: any = [];
  private errorMessage: string | null = null;
 

  public isSignUpAsyncCall: boolean = false;
  public isSignInAsyncCall: boolean = false;
  public signUpForm!: FormGroup;
  public loginForm!: FormGroup;
  public validationErrorMessage = validationErrorMessage;
  public hidePassword = true;
  public selectedEditorial:any;
  private orderId: string = '';
  private modalRef!: NgbModalRef;
  public isLogin: boolean = false;

  public pricingAndPlans: any = [];

  // isCollapsed = true;

  currentId:any

  pdfSrc :any;
  maxPages = 2;  // Allow only 2 pages before prompting for registration
  showOverlay = false;

  currentPage: number = 1;
  totalPages: number = 0;

  @ViewChild('content') content!: TemplateRef<any>;

  constructor(private authService: AuthService, private editorialService : EditorialService, private router : Router, private paymentService: PaymentService, private modalService: NgbModal) {}

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

    this.loadAllEditorial();
    
  }


  get signUpControl() {
    return this.signUpForm.controls;
  }

  get loginFormControl() {
    return this.loginForm.controls;
  }


  onPageRendered(event: any) {
   
  }


  seePlans(id:any) {
    this.pricingAndPlans = [id]
  }
 

      // Method triggered after PDF is loaded
  afterLoadComplete(event: any): void {
    this.totalPages = event.numPages;
    
  }

  // Method triggered when the page number changes
  onPageChange(page: any, id: any): void {
    this.currentPage = page.pageNumber;

    



    const currentAccordion: any = document.getElementById('collapse' + id);
    if(currentAccordion) {
      const overLayElement = currentAccordion.querySelector('#overlay' + id);
      // pdfViewer &&
      if ( this.currentPage > this.maxPages) {
        this.showOverlay = true;  // Show overlay after page 2
        overLayElement?.style.setProperty('visibility', 'visible');
        // document.getElementById('outerContainer')?.style.setProperty('filter', 'blur(5px)');
        currentAccordion.querySelector('#outerContainer')?.style.setProperty('filter', 'blur(5px)');
      } else {
        this.showOverlay = false;
        overLayElement?.style.setProperty('visibility', 'hidden');
        currentAccordion.querySelector('#outerContainer')?.style.setProperty('filter', 'none');
      }

    }
    
  }



  register() {
    localStorage.setItem('isRegister', JSON.stringify(true));
    this.router.navigateByUrl('/auth')
  }

   

  onBuy(row: any, planType: any, newPrice: any) {
    row.fee = newPrice;
    row.planType = planType;
    row.name = 'Editorials'
    this.selectedEditorial = row;
    console.log(row)
    this.paymentService.setSelectedProductForCheckout(this.selectedEditorial);
    this.modalRef = this.modalService.open(this.content,  { scrollable: true , ariaLabelledBy: 'modal-basic-title'});
  }



  registerUser() {
      const registerData: registerRequest = this.signUpForm.value; // Extract form data
    
      this.isSignUpAsyncCall = true;
      this.loading = true; // Set loading state
    
      // Log selectedEditorial to debug the issue
      const selectedEditorial = this.paymentService.getSelectedProductForCheckout()
    
      if (!selectedEditorial || !selectedEditorial.fee) {
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
            productid: '',
            moduleType: 'dailyeditorial'
          }
          localStorage.setItem('product', JSON.stringify(product))
          this.closeModal();
          this.router.navigateByUrl(`/dash/payment/checkout/${registerResponse.response.userId}`); // Navigate to checkout
          this.signUpForm.reset(); // Reset the form after successful registration

        }),
        // switchMap(registerResponse => {
        //   // Step 2: Create order after registration
        //   const paymentOrderData: PaymentOrder = {
        //     amount: selectedEditorial.fee, // Use the validated amount
        //     currency: 'INR',
        //     receipt: registerResponse.response.id, // Use response ID as receipt
        //     productId: this.selectedEditorial.id
        //   };
    
        //   return this.paymentService.createOrder(paymentOrderData); // Call the Create Order API
        // }),
        // tap(orderResponse => {
        //   if (orderResponse) {
        //     this.orderId = orderResponse.data.orderId; // Assuming orderResponse contains an 'id' field
        //     const product = {
        //       userid: orderResponse.data.userId,
        //       productid: orderResponse.data.productId,
        //       moduleType: 'dailyeditorial'
        //     }
        //     localStorage.setItem('product', JSON.stringify(product))
        //   } else {
        //     throw new Error('Order creation failed. Response is empty.');
        //   }
        // }),
        // switchMap(() => {
        //   if (this.orderId) {
        //     // this.paymentService.setSelectedProductForCheckout(this.selectedEditorial); // Save selected product
        //     this.closeModal();
        //     this.router.navigateByUrl(`/payment/checkout/${this.orderId}`); // Navigate to checkout
        //   } else {
        //     throw new Error('Order ID is missing. Cannot navigate to checkout.');
        //   }
        //   return of(null);
        // }),
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
      
        // Log selectedEditorial to debug the issue (optional)
        const selectedEditorial = this.paymentService.getSelectedProductForCheckout();
      
        if (!selectedEditorial || !selectedEditorial.fee) {
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
                productid: '',
                moduleType: 'dailyeditorial'
              };
              localStorage.setItem('product', JSON.stringify(product));
            this.closeModal();
              this.router.navigateByUrl(`/dash/payment/checkout/${loginResponse.response.userId}`); 
          }),
          // switchMap(loginResponse => {
          //   // Step 2: Create order after login (if needed)
          //   const paymentOrderData: PaymentOrder = {
          //     amount: selectedEditorial.fee, // Use the validated amount
          //     currency: 'INR',
          //     receipt: loginResponse.response.userId, // Use user ID or any other identifier as receipt
          //     productId: selectedEditorial.id // Use selected test series ID
          //   };
        
          //   return this.paymentService.createOrder(paymentOrderData); // Call the Create Order API
          // }),
          // tap(orderResponse => {
          //   if (orderResponse) {
          //     this.orderId = orderResponse.data.orderId; // Assuming orderResponse contains an 'id' field
          //     const product = {
          //       userid: orderResponse.data.userId,
          //       productid: orderResponse.data.productId,
          //       moduleType: 'dailyeditorial'
          //     };
          //     localStorage.setItem('product', JSON.stringify(product));
          //   } else {
          //     throw new Error('Order creation failed. Response is empty.');
          //   }
          // }),
          // switchMap(() => {
          //   if (this.orderId) {
          //     // this.paymentService.setSelectedProductForCheckout(this.selectedTestSeries); // Save selected product
          //     this.closeModal();
          //     this.router.navigateByUrl(`/payment/checkout/${this.orderId}`); // Navigate to checkout
          //   } else {
          //     throw new Error('Order ID is missing. Cannot navigate to checkout.');
          //   }
          //   return of(null);
          // }),
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
 

 

 



  private loadAllEditorial(): void {
        this.loading = true; // Set loading state to true while fetching data
        const currentDateTimeUTC = new Date().toISOString();
        this.editorialService.getEditorialBycurrentDate(currentDateTimeUTC).pipe(
          tap((response: any) => {
            this.allEditoril = response
            // this.showPdf(this.allEditoril[0].filePath, this.allEditoril[0].id)
            
          }),
          catchError((error) => {
            this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
            console.error('Error loading Daily editorials:', error);
            this.allEditoril = []; 
            return of([]); // Return an empty array in case of an error
          }),
          finalize(() => {
            this.loading = false; // Reset loading state when the request is completed
          })
        ).subscribe();
      }

      closeModal() {
        if (this.modalRef) {
          this.modalRef.close(); // Close the modal
        }
      }
   
}
