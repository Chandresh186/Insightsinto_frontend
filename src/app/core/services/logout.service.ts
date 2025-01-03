import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { API_CONSTANTS } from '../constants/api.constant';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
private baseUrl = environment.URL;
constructor(private httpService: HttpService<any>) { }

 private getHeaders(): HttpHeaders {
          const token: string = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
          return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          });
        }

  // Logout method
  logout(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.AUTH.LOGOUT}`, data, headers);
  }
}
