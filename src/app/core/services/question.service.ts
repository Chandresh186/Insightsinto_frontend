import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpService } from './http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>) { }

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

  uploadCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name); // Append CSV file

    const headers = this.getHeadersFormData();

    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.Questions.UPLOAD_CSVFILE}`, formData,  headers );
  }

   // Create a new category (POST)
   createQuestion(data: any): Observable<any> {
    const headers = this.getHeaders();
    // const formData: any = new FormData();

    // formData.append('Title', data.title);
    // formData.append('BlogContent', data.content);
    // formData.append('Description', data.description);

    // if (data.tags && data.tags.length > 0) {
    //   formData.append('Tags', JSON.stringify( data.tags)); // Append each topic individually
    // }

    // // Append files
    // if (data.coverImage && data.coverImage.length > 0) {
    //   data.coverImage.forEach((img: File) => {
    //     formData.append('CoverImage', img, img.name); // Add file name if necessary
    //   });
    // }

    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.Questions.CREATE_QUESTION}`, data, headers);
  }

  // Get all categories (GET)
  getAllQuestions(): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.Questions.GET_ALL_QUESTIONS}`, headers);
  }

  // Get a category by its ID (GET)
  getQuestionById(id: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.Questions.GET_QUESTION_BY_ID(id)}`,headers );
  }

  // Update a category (PUT)
  updateQuestion(id: any, data: any): Observable<any> {
    const headers = this.getHeaders();
    // const formData: any = new FormData();

    // formData.append('Title', data.title);
    // formData.append('BlogContent', data.content);
    // formData.append('Description', data.description);

    // if (data.tags && data.tags.length > 0) {
    //   formData.append('Tags', JSON.stringify( data.tags)); // Append each topic individually
    // }

    // // Append files
    // if (Array.isArray(data.coverImage) && data.coverImage.length > 0) {
    //   data.coverImage.forEach((img: File) => {
    //     formData.append('CoverImage', img, img.name); // Add file name if necessary
    //   });
    // }

   
    return this.httpService.update(`${this.baseUrl}${API_CONSTANTS.Questions.UPDATE_QUESTION_BY_ID(id)}`, data, headers);
  }

  // Delete a category (DELETE)
  deleteQuestion(id:any): Observable<void> {
    const headers = this.getHeaders();
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.Questions.DELETE_QUESTION_BY_ID(id)}`,headers);
  }
}
