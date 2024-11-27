import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment.development';
import { API_CONSTANTS } from '../constants/api.constant';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TestSeriesService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>, private http: HttpClient) { }

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

    

    createTest(testSeriesId: string, data: any) {
      const formData: any = new FormData();
    
      // Append scalar fields
      formData.append('Title', data.title);
      formData.append('SubTitle', data.subTitle);
      formData.append('MinimumPassingScore', data.minimumPassingScore);
      formData.append('Duration', data.duration);
      formData.append('Language', data.language);
    
      // Append array fields (Topics, Keywords, CategoryIds) as individual form fields
      if (data.topics && data.topics.length > 0) {
          formData.append('Topics', JSON.stringify( data.topics)); // Append each topic individually
      }
      if (data.keyWords && data.keyWords.length > 0) {
          formData.append('Keywords', JSON.stringify( data.keyWords)); // Append each keyword individually
      }
      if (data.categoryIds && data.categoryIds.length > 0) {
          formData.append('CategoryIds', JSON.stringify(data.categoryIds)); // Append each categoryId individually
      }
    
        // Append files
      if (data.files && data.files.length > 0) {
        data.files.forEach((file: File) => {
          formData.append('Files', file, file.name); // Add file name if necessary
        });
      }
    
    
      return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.CREATE_TEST(testSeriesId)}`, formData);
    }

    deleteTest(testSeriesId: any, testId: any): Observable<void> {
      return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.DELETE_TEST(testSeriesId, testId)}`);
    }


    addQuestionToTest(data: any): Observable<any> {
      return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.ADD_QUESTIONS_TO_TEST}`, data);
    }
    
  


    getTestByTestSeries(id: any): Observable<any> {
      return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.GET_TEST_By_TEST_SERIES_ID(id)}`);
    }

    getTestById(id: any): Observable<any> {
      return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.TESTSERIES.GET_TEST_BY_ID(id)}`);
    }
}
