import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>, private http: HttpClient) { }


  getAdminDashboard(): Observable<any[]> {
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.ADMIN_DASHBOARD.GET_ADMIN_DASHBOARD}`);
  }
}
