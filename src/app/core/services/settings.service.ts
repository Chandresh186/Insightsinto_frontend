import { inject, Injectable, Signal, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';
import { HttpHeaders } from '@angular/common/http';

interface Setting {
  id: string;
  moduleName: string;
  show: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private baseUrl = environment.URL;
  private settingsSignal = signal<Setting[]>([]);

  constructor(private httpService: HttpService<any>) {}

   // ✅ Getter to access settings
   get settings(): Signal<Setting[]> {
    return this.settingsSignal;
  }

  private getHeaders(): HttpHeaders {
    const token: string = JSON.parse(
      localStorage.getItem('currentUser') as string
    )?.response?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  getUserById(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.get(
      `${this.baseUrl}${API_CONSTANTS.USER.GET_USER_BY_ID(id)}`,
      headers
    );
  }

  getSettingList(): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.get(
      `${this.baseUrl}${API_CONSTANTS.SETTINGS.GET_ALL_SETTINGS}`,
      headers
    );
  }

  fetchSettings(): void {
    const headers = this.getHeaders();
    this.httpService.get(`${this.baseUrl}${API_CONSTANTS.SETTINGS.GET_ALL_SETTINGS}`,  headers)
      .subscribe(data =>{console.log(data); this.settingsSignal.set(data)});
  }

  updateSetting(id: string, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.update(
      `${this.baseUrl}${API_CONSTANTS.SETTINGS.UPDATE_SETTING(id)}`,
      data,
      headers
    );
  }

  createSetting(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.post(
      `${this.baseUrl}${(API_CONSTANTS.SETTINGS.ADD_SETTINGS, data)}`,
      headers
    );
  }

  updateUser(id: any, userData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.post(
      `${this.baseUrl}${API_CONSTANTS.USER.UPDATE_USER(id)}`,
      userData,
      headers
    );
  }

  isModuleVisible(moduleName: string): boolean {
    return this.settingsSignal().find(setting => setting.moduleName === moduleName)?.show ?? false;
  }
}
