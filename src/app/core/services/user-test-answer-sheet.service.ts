import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';
import { environment } from '../../../environments/environment.development';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class UserTestAnswerSheetService {
 private baseUrl = environment.URL;
  constructor(
    private httpService: HttpService<any>,
    private http: HttpClient
  ) {}

  private getHeaders(): HttpHeaders {
    const token: string = JSON.parse(
      localStorage.getItem('currentUser') as string
    )?.response?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private getHeadersFormData(): HttpHeaders {
    const token: string = JSON.parse(
      localStorage.getItem('currentUser') as string
    )?.response?.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }



  getAllAnswerSheetByChaptersId(id: any): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpService.get(
      `${this.baseUrl}${API_CONSTANTS.ANSWERSHEET.GET_CHAPTER_ANSWERSHEET_BY_COURSEID(id)}`,
      headers
    );
  }

  // GET_CHAPTERS_COURSES_BY_COURSEID

  uploadTestPaper(data: any) {
    const headers = this.getHeadersFormData();
    const formData: any = new FormData();
    // Append scalar fields
    formData.append('UserId', data.UserId);
    // formData.append('TestId', data.TestId);
    formData.append('CourseId', data.CourseId);
    formData.append('UserName', data.UserName);
    formData.append('UserEmail', data.UserEmail);
    
  
      // Append files
    if (data.Sheet && data.Sheet.length > 0) {
      data.Sheet.forEach((file: File) => {
        formData.append('Sheet', file); // Add file name if necessary
      });
    }
  
  
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.ANSWERSHEET.UPLOAD_TEST}`, formData, headers);
  }





  getCourseById(id: any): Observable<any> {
    const headers = this.getHeaders()
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.Courses.GET_COURSE_BY_ID(id)}`, headers );
  }

  }

