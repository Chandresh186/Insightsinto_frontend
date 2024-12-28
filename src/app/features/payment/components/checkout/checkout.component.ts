import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment.development';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CouponService } from '../../../../core/services/coupon.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { PaymentOrder } from '../../../../core/models/interface/payment.interface';

interface Alert {
	type: string;
	message: string;
}

const ALERTS: Alert[] = [

	{
		type: 'warning',
		message: 'Do not refresh the page while we process your payment.',
	},
	
	
];

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ngbootstrapModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  razorPayKey: any = environment.key_id;
  selectedProduct!: any;
  product: any;
  alerts!: Alert[];

  public Subtotal: any = 0;
  public discount: any = 0;
  public total: any = 0;
  public discountPercentage: any = 0;  // Example discount percentage
  public couponForm!: FormGroup;

  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public couponMessage: string = '';
  public isValid: boolean =false;
  isUserLoggedIn!: boolean;
  
  
  constructor(private route : ActivatedRoute, private router : Router, private paymentService: PaymentService,private couponService : CouponService ) {
    this.reset();
  }


  
	close(alert: Alert) {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
	}

	reset() {
		this.alerts = Array.from(ALERTS);
	}
  
  

  ngOnInit() {
    this.isUserLoggedIn = localStorage.getItem('currentUser') !== null;
    this.product = JSON.parse(localStorage.getItem('product') || '{}');
    this.listenSelectedProduct();
    this.getUserId()
  //   window.onload = function() {
  //     if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
  //         // Redirect to the homepage if the page was reloaded
  //         localStorage.removeItem('product');
  //         alert('Transaction has been cancelled.');

  //         window.location.href = '/'; // Or the path to your homepage
  //     }
  // };

   // Initialize the form group here
   this.couponForm = new FormGroup({
    couponCode: new FormControl('')  // Added Validators
  });

  }
  getOrderId() {
    return this.route.snapshot.params['id']
  }

  getUserId() {
    return this.route.snapshot.params['id']
  }

  get couponFormControl() {
    return this.couponForm.controls;
  }




   // Directly calculating the totals in the component
   calculate(amount: any) {
    let subtotal = amount;  // Subtotal is the original amount
    let discount = 0;
    if (this.discountPercentage > 0) {
      discount = (subtotal * this.discountPercentage) / 100;  // Calculate the discount
    }

    let total = subtotal - discount;  // Total after discount

    // Update the component's properties
    this.Subtotal = subtotal;
    this.discount = discount;
    this.total = total;
  }


  handleInput(event: Event): void {
    const inputField = event.target as HTMLInputElement;
  
    // Get the current value of the input
    let currentValue = inputField.value;
  
    // Remove any non-alphanumeric characters (no spaces, special chars)
    currentValue = currentValue.replace(/[^a-zA-Z0-9]/g, '');
  
    // Ensure the first character is a letter
    if (currentValue.length > 0 && /^[0-9]/.test(currentValue[0])) {
        // Remove the invalid number if it's the first character
        currentValue = currentValue.slice(1);
    }
  
    // Separate letters and numbers
    const letters = currentValue.replace(/[^A-Za-z]/g, ''); // Extract only letters
    const numbers = currentValue.replace(/[^0-9]/g, ''); // Extract only numbers
  
    // Combine letters first, then numbers
    inputField.value = letters.toUpperCase() + numbers;
  }



  applyCoupon() {
    // this.couponCode.valueChanges.subscribe(value => {
    //   // do something with value here
    //   console.log(value)
    // });

    console.log(this.couponForm.value)
    console.log(this.couponForm.get('couponCode')?.value)


     this.loading = true; // Set loading state
        this.couponService.getCouponByCode(this.couponForm.get('couponCode')?.value).pipe(
          tap(response => {
    
           console.log(response)
           this.discountPercentage = response.data.discountPercentage
           this.calculate(this.selectedProduct.fee)

           // Logic for applying coupon
            if (response.data.code === this.couponForm.get('couponCode')?.value) {
              // this.getNewOrderId();
              this.isValid = true;
              this.couponMessage = 'Coupon applied successfully!';  // Success message
            } else {
              this.isValid = false;
              this.couponMessage = 'Invalid coupon code.';  // Invalid coupon message
            }
          
          }),
          catchError(error => {
            this.errorMessage = 'Coupon failed. Please try again.'; // Handle error
          
            this.isValid = false;
            this.couponMessage = 'Invalid coupon code.';  // Invalid coupon message
       
            return of(null); // Return a default value to continue the stream
          }),
          finalize(() => {
            this.loading = false; // Reset loading state
          })
        ).subscribe();
  }

  // redirect() {
  //   this.router.navigate(['/payment/checkout/order_Pbrdh0QHB0TabM'])
  //   setTimeout(()=> {
  
  //     console.log( this.getOrderId() )
  //   },2000)
  // }

  removeCoupon() {

    this.couponForm.reset();
    this.isValid = false;
    this.couponMessage = '';
    this.discountPercentage = 0;
    this.calculate(this.selectedProduct && this.selectedProduct.fee);
  }


  createOrder() {
     const paymentOrderData: PaymentOrder = {
                  amount: this.total.toString(), // Use the validated amount
                  currency: 'INR',
                  receipt: this.product.userid, // Use user ID or any other identifier as receipt
                  productId: this.selectedProduct.id // Use selected test series ID
                };
    this.loading = true; // Set loading state to true while fetching data
  
    this.paymentService.createOrder(paymentOrderData).pipe(
      tap((response: any) => {
        console.log(response)

        this.payWithRazorpay(response.data.orderId);
        
      }),
      catchError((error) => {
        this.errorMessage = 'Error creating order.'; // Handle error message
        console.error('Error creating order:', error);
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
     
      })
    ).subscribe();
  }


  cancelPayment() {
    localStorage.removeItem('product');
    this.paymentService.clearSelectedProduct();
  }

 
  
  listenSelectedProduct() {
    this.selectedProduct = this.paymentService.getSelectedProductForCheckout();
    this.calculate(this.selectedProduct && this.selectedProduct.fee)
    console.log(this.selectedProduct)
  }

  payWithRazorpay(paymentOrderId: any) {
    console.log(this.total )
    // const paymentOrderId = this.getOrderId();
    const options: any = {
      key: this.razorPayKey,
      amount: this.total * 100, //  this.total * 100 amount should be in paise format to display Rs 1255 without decimal point
      currency: 'INR',
      name: 'InsightInto', // company name or product name
      description: 'Online Coaching', // product description
      image: '../../../assets/sidebar-restore-icon.svg', // company logo or product image
      order_id: paymentOrderId, // order_id created by you in backend
      modal: {
        // We should prevent closing of the form when esc key is pressed.
        escape: false,
      },
      notes: {
        // include notes if any
      },
      theme: {
        color: '#ddcbff',
      },
    };
    options.handler = (response: any, error: any) => {
      options.response = response;
      if(error) {
        localStorage.removeItem('product');
        this.paymentService.clearSelectedProduct();
        this.router.navigate(['dash/payment/failure']);
      } else {
        this.verifyPayment(response)
      }
    };
    options.modal.ondismiss = () => {
      alert('Transaction has been cancelled.')
      localStorage.removeItem('product');
      this.paymentService.clearSelectedProduct();
      this.router.navigate(['dash/payment/failure']);
    };
    const rzp = new this.paymentService.nativeWindow.Razorpay(options);
    rzp.open();

}



verifyPayment(res:any) {
  const data = {
    razorpayOrderId: res.razorpay_order_id,
    razorpayPaymentId: res.razorpay_payment_id,
    razorpaySignature: res.razorpay_signature,
    userId: this.product.userid,
    productid: this.product.productid,
    moduleType: this.product.moduleType,
    planType: this.selectedProduct.planType,
    paidAmount: this.total.toString()
  }
  this.paymentService.verify_Payment(data).subscribe({
    next: (response) => {
      // Navigate to success or dashboard page after verification
      localStorage.removeItem('product');
      this.paymentService.clearSelectedProduct();
      this.router.navigate(['/dash/payment/success']);  // Adjust the route as needed
    },
    error: (error) => {
      console.error('Error verifying payment:', error);
      localStorage.removeItem('product');
      this.paymentService.clearSelectedProduct();
      this.router.navigate(['/dash/payment/failure']);
      // Handle error as needed
    }
  });
}
 

failed() {
  this.router.navigate(['/payment/failure']);
}

success() {
  this.router.navigate(['/payment/success']);
}
    
}







