import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TableComponent } from "../../../shared/resusable_components/table/table.component";
import { TestSeriesService } from '../../../core/services/test-series.service';
import { BehaviorSubject, catchError, finalize, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { ModalDismissReasons, NgbDatepickerModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { testSeriesValidationErrorMessage, validationErrorMessage } from '../../../core/constants/validation.constant';
import { PaymentService } from '../../../core/services/payment.service';
import { Router } from '@angular/router';
import { patternValidator } from '../../../shared/helper.service';
import { registerRequest } from '../../../core/models/interface/register_request.interface';
import { AuthService } from '../../../core/services/auth.service';
import { AsyncButtonComponent } from '../../../shared/resusable_components/async-button/async-button.component';
import { PaymentOrder } from '../../../core/models/interface/payment.interface';
import { loginRequest } from '../../../core/models/interface/login_request.interface';

@Component({
  selector: 'app-test-series-landing-page',
  standalone: true,
  imports: [CommonModule, TableComponent, NgbDatepickerModule, ReactiveFormsModule, AsyncButtonComponent],
  templateUrl: './test-series-landing-page.component.html',
  styleUrl: './test-series-landing-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TestSeriesLandingPageComponent implements OnInit{

  // Example table headers
  tableHeaders:any = [
    // { key: 'id', displayName: 'ID' },
    // { key: 'name', displayName: 'Name' },
    // { key: 'medium', displayName: 'Medium' },
    // { key: 'details', displayName: 'Details' },
    // { key: 'startDate', displayName: 'Start Date' },
    // { key: 'fee', displayName: 'Fee' }
  ];


    // Example table data
    tableData:any = [
      // {
      //   id: '1',
      //   name: 'Test Series 1',
      //   medium: 'Online',
      //   details: 'Details about Test Series 1',
      //   startDate: '2024-11-12',
      //   fee: '1000'
      // },
      // {
      //   id: '2',
      //   name: 'Test Series 2',
      //   medium: 'Offline',
      //   details: 'Details about Test Series 2',
      //   startDate: '2024-11-15',
      //   fee: '1500'
      // }
    ];




    // Dynamic Actions Config
    actionsConfig = [
      { key: 'buy', label: 'Buy', class: 'btn-primary', visible: true },
      // { key: 'delete', label: 'Delete', class: 'btn-danger', visible: true },
      // { key: 'view', label: 'View', class: 'btn-secondary', visible: false }, // Hidden action
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


  constructor( private authService: AuthService, private testSeriesService: TestSeriesService, private modalService: NgbModal, private paymentService: PaymentService, private router : Router) {}

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
  
    this.loadTestSeries();

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


  // generateTableHeaders(dataArray: any[]): { key: string; displayName: string }[] {
  //   if (!dataArray || dataArray.length === 0) {
  //     return [];
  //   }
  
  //   const formatDisplayName = (key: string): string =>
  //     key
  //       .replace(/([A-Z])/g, ' $1') // Add a space before uppercase letters (camelCase to spaced)
  //       .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  
  //   return Object.keys(dataArray[0]).map((key) => ({
  //     key: key,
  //     displayName: formatDisplayName(key),
  //   }));
  // }

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
      else if (key === 'startDate') {
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
    this.modalRef = this.modalService.open(this.content,  { scrollable: true , ariaLabelledBy: 'modal-basic-title'});
   
   
  }




    // Reactive loading of test series
    private loadTestSeries(): void {
      this.loading = true; // Set loading state to true while fetching data
    
      this.testSeriesService.getTestSeries().pipe(
        tap((response: any) => {
          this.tableData = response.response; // Assign the fetched data to the list
          this.showColumns  = this.generateTableHeaders(response.response.map(({ id, ...rest }: any) => rest));
          this.tableHeaders = this.generateTableHeaders(response.response)
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


  //     // Add a new test series
  // public addTestSeries(): void {
  //   of(this.newTestSeries) // Simulate the input as an observable
  //     .pipe(
  //       switchMap((series) =>
  //         this.testSeriesService.createTestSeries(series).pipe(
  //           tap(() => {
  //             this.newTestSeries = { id: 0, name: '', description: '', totalMarks: 0, duration: '' }; // Reset form
  //             this.refresh$.next(); // Trigger reload
  //           }),
  //           catchError((error) => {
  //             this.error$.next('Error creating test series');
  //             console.error('Error creating test series:', error);
  //             return of(null); // Emit null on error
  //           })
  //         )
  //       )
  //     )
  //     .subscribe();
  // }


  //   // Delete a test series
  //   public deleteTestSeries(id: number): void {
  //     of(id) // Simulate the input as an observable
  //       .pipe(
  //         switchMap((seriesId) =>
  //           this.testSeriesService.deleteTestSeries(seriesId).pipe(
  //             tap(() => this.refresh$.next()), // Trigger reload on success
  //             catchError((error) => {
  //               this.error$.next('Error deleting test series');
  //               console.error('Error deleting test series:', error);
  //               return of(null); // Emit null on error
  //             })
  //           )
  //         )
  //       )
  //       .subscribe();
  //   }


  //   public getError(): Observable<string | null> {
  //     return this.error$.asObservable();
  //   }



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
          moduleType: 'testseries'
        }
        localStorage.setItem('product', JSON.stringify(product))
        this.closeModal();
        this.router.navigateByUrl(`/dash/payment/checkout/${registerResponse.response.userId}`); // Navigate to checkout
        this.signUpForm.reset(); // Reset the form after successful registration
      }),
      // switchMap(registerResponse => {
      //   // Step 2: Create order after registration
      //   const paymentOrderData: PaymentOrder = {
      //     amount: selectedTestSeries.fee, // Use the validated amount
      //     currency: 'INR',
      //     receipt: registerResponse.response.id, // Use response ID as receipt
      //     productId: this.selectedTestSeries.id
      //   };
  
      //   return this.paymentService.createOrder(paymentOrderData); // Call the Create Order API
      // }),
      // tap(orderResponse => {
      //   if (orderResponse) {
      //     this.orderId = orderResponse.data.orderId; // Assuming orderResponse contains an 'id' field
      //     const product = {
      //       userid: orderResponse.data.userId,
      //       productid: orderResponse.data.productId,
      //       moduleType: 'testseries'
      //     }
      //     localStorage.setItem('product', JSON.stringify(product))
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
            moduleType: 'testseries'
          };
          localStorage.setItem('product', JSON.stringify(product));
          this.closeModal();
          this.router.navigateByUrl(`/dash/payment/checkout/${loginResponse.response.userId}`); // Navigate to checkout
          this.loginForm.reset();
      }),
      // switchMap(loginResponse => {
      //   // Step 2: Create order after login (if needed)
      //   const paymentOrderData: PaymentOrder = {
      //     amount: selectedTestSeries.fee, // Use the validated amount
      //     currency: 'INR',
      //     receipt: loginResponse.response.userId, // Use user ID or any other identifier as receipt
      //     productId: selectedTestSeries.id // Use selected test series ID
      //   };
    
      //   return this.paymentService.createOrder(paymentOrderData); // Call the Create Order API
      // }),
      // tap(orderResponse => {
      //   if (orderResponse) {
      //     this.orderId = orderResponse.data.orderId; // Assuming orderResponse contains an 'id' field
      //     const product = {
      //       userid: orderResponse.data.userId,
      //       productid: orderResponse.data.productId,
      //       moduleType: 'testseries'
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
