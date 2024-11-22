import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment.development';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';

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
  imports: [CommonModule, RouterModule, ngbootstrapModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  razorPayKey: any = environment.key_id;
  selectedProduct!: any;
  product: any;
  alerts!: Alert[];
  
  constructor(private route : ActivatedRoute, private router : Router, private paymentService: PaymentService, ) {
    this.reset();
  }


  
	close(alert: Alert) {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
	}

	reset() {
		this.alerts = Array.from(ALERTS);
	}
  
  

  ngOnInit() {
    this.product = JSON.parse(localStorage.getItem('product') || '{}');
    console.log(this.product)
    this.listenSelectedProduct();
    this.getOrderId()
    window.onload = function() {
      if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
          // Redirect to the homepage if the page was reloaded
          window.location.href = '/'; // Or the path to your homepage
      }
  };

  }
  getOrderId() {
    return this.route.snapshot.params['id']
  }


 
  
  listenSelectedProduct() {
    this.selectedProduct = this.paymentService.getSelectedProductForCheckout();
    console.log(this.selectedProduct)
  }

  payWithRazorpay() {
    const paymentOrderId = this.getOrderId();
    const options: any = {
      key: this.razorPayKey,
      amount: this.selectedProduct?.fee * 100, // amount should be in paise format to display Rs 1255 without decimal point
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
        console.log("error")
        this.router.navigate(['/payment/failure']);
      } else {
        this.verifyPayment(response)
      }
    };
    options.modal.ondismiss = () => {
      alert('Transaction has been cancelled.')
      this.router.navigate(['/payment/failure']);
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
    productid: this.product.productid
  }
  this.paymentService.verify_Payment(data).subscribe({
    next: (response) => {
      console.log('Payment Verified:', response);
      // Navigate to success or dashboard page after verification
      localStorage.removeItem('product');
      this.router.navigate(['/payment/success']);  // Adjust the route as needed
    },
    error: (error) => {
      console.error('Error verifying payment:', error);
      localStorage.removeItem('product');
      this.router.navigate(['/payment/failure']);
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







