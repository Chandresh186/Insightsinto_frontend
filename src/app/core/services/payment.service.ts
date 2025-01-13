import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import {
  PaymentOrder,
  VerifyPayment,
} from '../models/interface/payment.interface';
import { API_CONSTANTS } from '../constants/api.constant';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = environment.URL;
  selectedProductForCheckout!: any;

  constructor(
    private httpService: HttpService<any>,
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  // Method to create an order
  createOrder(data: PaymentOrder): Observable<any> {
    return this.httpService.post(
      `${this.baseUrl}${API_CONSTANTS.PAYMENT.CREATE_ORDER}`,
      data
    );
  }

  verify_Payment(data: VerifyPayment): Observable<any> {
    return this.httpService.post(
      `${this.baseUrl}${API_CONSTANTS.PAYMENT.VERIFY_PAYMENT}`,
      data
    );
  }

  getSelectedProductForCheckout() {
    // return this.selectedProductForCheckout;
    const product = localStorage.getItem('selectedProductForCheckout');
    return product ? JSON.parse(product) : null; // Parse JSON if product exists
  }

  setSelectedProductForCheckout(product: any) {
    // this.selectedProductForCheckout = product;
    localStorage.setItem('selectedProductForCheckout', JSON.stringify(product)); // Store as JSON
  }

    // Clear the selected product from localStorage
  clearSelectedProduct(): void {
    localStorage.removeItem('selectedProductForCheckout');
  }

  get nativeWindow(): any {
    if (isPlatformBrowser(this.platformId)) {
      return _window();
    }
  }
}

function _window(): any {
  // return the global native browser window object
  return window;
}
