import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>) { }

  getUserById(id: string): Observable<any> {
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.USER.GET_USER_BY_ID(id)}`);
  }

  updateUser(id: any, userData: any): Observable<any> {
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.USER.UPDATE_USER(id)}`, userData);
  }
}
