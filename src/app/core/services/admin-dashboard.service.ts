import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>, private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token: string = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getAdminDashboard(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.ADMIN_DASHBOARD.GET_ADMIN_DASHBOARD}`, headers);
  }
}
