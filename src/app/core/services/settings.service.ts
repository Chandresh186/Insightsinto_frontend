import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>) { }

    private getHeaders(): HttpHeaders {
          const token: string = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
          return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          });
        }

  getUserById(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.USER.GET_USER_BY_ID(id)}`, headers);
  }

  updateUser(id: any, userData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.USER.UPDATE_USER(id)}`, userData, headers);
  }
}
