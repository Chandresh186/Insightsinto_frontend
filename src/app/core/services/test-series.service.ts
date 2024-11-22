import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment.development';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class TestSeriesService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>) { }

    // Create Test Series
    createTestSeries(testSeries: any): Observable<any> {
      return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.CREATE_TEST_SERIES}`, testSeries);
    }
  
    // Get All Test Series
    getTestSeries(): Observable<any[]> {
      return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.GET_ALL_TEST_SERIES}`);
    }
  
    // Get Test Series by ID
    getTestSeriesById(id: any): Observable<any> {
      return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.GET_TEST_SERIES_BY_ID(id)}`);
    }
  
    // Update Test Series
    updateTestSeries(id: any, testSeries: any): Observable<any> {
      return this.httpService.update(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.UPDATE_TEST_SERIES(id)}`, testSeries);
    }
  
    // Delete Test Series
    deleteTestSeries(id: any): Observable<void> {
      return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.DELETE_TEST_SERIES(id)}`);
    }


     // Fetch Test Question
    fetchQuestionsForTest(testInput: any): Observable<any> {
      return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.FETCH_QUESTIONS_FOR_TEST}`, testInput);
    }


    getTestByTestSeries(id: any): Observable<any> {
      return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.GET_TEST_By_TEST_SERIES_ID(id)}`);
    }
}
