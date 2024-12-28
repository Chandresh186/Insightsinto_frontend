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

  

  createDailyEditorial(data: any) {
    console.log(data)
    const formData: any = new FormData();
    // Append scalar fields
   
  
  
  
      // Append files
    if (data.files && data.files.length > 0) {
      data.files.forEach((file: File) => {
        formData.append('Files', file); // Add file name if necessary
      });
    }
  
  
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.CREATE_DAILY_EDITORIAL}`, formData);
  }

  deleteEditorial(id: any): Observable<void> {
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.DELETE_EDITORIAL(id)}`);
  }


  getEditorialBycurrentDate(date: any): Observable<any> {
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.GET_EDITORISL_BY_CURRENT_DATE(date)}`);
  }

  getAllEditorials(): Observable<any[]> {
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.GET_ALL_EDITORIAL}`);
  }

  getAllEditorialsUser(id: any): Observable<any[]> {
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.DAILY_EDITORIAL.GET_ALL_EDITORIAL_By_UserId(id)}`);
  }


  getPdf(url: string) {
    return this.http.get(url, { responseType: 'blob', headers: new HttpHeaders({
      'Content-Type': 'application/pdf' // Specify the content type for the request
    }) });
  }
}
