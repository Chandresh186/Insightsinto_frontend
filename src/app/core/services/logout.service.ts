import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
private baseUrl = environment.URL;
constructor(private httpService: HttpService<any>) { }
  // Logout method
  logout(data: any): Observable<any> {
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.AUTH.LOGOUT}`, data);
  }
}
