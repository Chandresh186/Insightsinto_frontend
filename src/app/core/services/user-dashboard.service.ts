import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>, private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token: string = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
        return new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        });
      }

   getUserDashboard(userId: string): Observable<any[]> {
    const headers = this.getHeaders();
      return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.USER_DASHBOARD.GET_USER_DASHBOARD(userId)}`, headers);
    }
}
