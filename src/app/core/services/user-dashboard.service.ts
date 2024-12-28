import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>, private http: HttpClient) { }


   getUserDashboard(userId: string): Observable<any[]> {
      return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.USER_DASHBOARD.GET_USER_DASHBOARD(userId)}`);
    }
}
