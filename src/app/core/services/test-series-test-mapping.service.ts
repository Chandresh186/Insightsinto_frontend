import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TestSeriesTestMappingService {
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


  // GET_CHAPTERS_COURSES_BY_COURSEID

  createMapping(data: any) {
    const headers = this.getHeadersFormData();
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.Test_SERIES_TEST_MAPPING.CREATE_MAPPING}`, data, headers);
  }


  DeleteTestFromMapping(testSeriesId: any, testId: any): Observable<any> {
    const headers = this.getHeaders()
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.Test_SERIES_TEST_MAPPING.DELETE_MAPPING(testSeriesId, testId)}`, headers );
  }

}
