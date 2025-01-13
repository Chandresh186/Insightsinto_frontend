import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpService } from './http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class EditorialService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>, private http: HttpClient) { }
  private getHeaders(): HttpHeaders {
    const token: string = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }


  private getHeadersFormData(): HttpHeaders {
    const token: string = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  

  createDailyEditorial(data: any) {
    const headers = this.getHeadersFormData();
    const formData: any = new FormData();
    // Append scalar fields
   
    // Append upload date if provided
    if (data.uploadDate) {
      formData.append('UploadDate', data.uploadDate);
    }
  
    formData.append('FileName', data.fileName);
  
      // Append files
    if (data.files && data.files.length > 0) {
      data.files.forEach((file: File) => {
        formData.append('Files', file); // Add file name if necessary
      });
    }
  
  
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.CREATE_DAILY_EDITORIAL}`, formData, headers);
  }

  deleteEditorial(id: any): Observable<void> {
    const headers = this.getHeaders();
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.DELETE_EDITORIAL(id)}`, headers);
  }


  getEditorialBycurrentDate(date: any): Observable<any> {
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.GET_EDITORISL_BY_CURRENT_DATE(date)}`);
  }

  getAllEditorials(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.GET_ALL_EDITORIAL}`, headers);
  }

  getAllEditorialsUser(id: any): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.GET_ALL_EDITORIAL_By_UserId(id)}`,headers);
  }


  getPdf(url: string) {
    return this.http.get(url, { responseType: 'blob', headers: new HttpHeaders({
      'Content-Type': 'application/pdf' // Specify the content type for the request
    }) });
  }
}
