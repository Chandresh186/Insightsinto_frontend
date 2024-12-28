import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>) { }

  createCoupon(data: any): Observable<any> {
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.COUPONS.CREATE_COUPON}`, data);
  }
  
  // Get all categories (GET)
  getAllCoupons(): Observable<any> {
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.COUPONS.GET_ALL_COUPON}`);
  }


  getCouponByCode(code: string): Observable<any> {
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.COUPONS.GET_COUPON_BY_CODE(code)}`);
  }


  deleteCoupon(id:any): Observable<void> {
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.COUPONS.DELETE_COUPON_BY_ID(id)}`);
  }
}


