import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { API_CONSTANTS } from '../constants/api.constant';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
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

   // Create a new category (POST)
   createCategory(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.CREATE_CATEGORY}`, data, headers);
  }

  createResourceCategory(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.RESOURCE_CATEGORIES.CREATE_CATEGORY}`, data, headers);
  }

  // Get all categories (GET)
  getCategories(): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.GET_ALL_CATEGORIES}`,headers);
  }

  getResourceCategories(): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.RESOURCE_CATEGORIES.GET_ALL_CATEGORIES}`,headers);
  }

  getallmappedCategories(): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.GET_ALL_MAPPED_CATEGORIES}`,headers);
  }

  getallmappedResourceCategories(): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.RESOURCE_CATEGORIES.GET_ALL_MAPPED_CATEGORIES}`,headers);
  }

  getallmappedResourceCategoriesContents(): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.RESOURCE_CATEGORIES.GET_ALL_MAPPED_CATEGORIES_CONTENTS}`,headers);
  }

  // Get a category by its ID (GET)
  getCategoryById(id: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.GET_CATEGORY_BY_ID(id)}`, headers );
  }

  // Update a category (PUT)
  updateCategory(id: any, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.update(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.UPDATE_CATEGORY(id)}`, data, headers);
  }

  updateResourceCategory(id: any, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.update(`${this.baseUrl}${API_CONSTANTS.RESOURCE_CATEGORIES.UPDATE_CATEGORY(id)}`, data, headers);
  }

  // Delete a category (DELETE)
  deleteCategory(id:any): Observable<void> {
    const headers = this.getHeaders();
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.DELETE_CATEGORY(id)}`, headers);
  }



  deleteResourceCategory(id:any): Observable<void> {
    const headers = this.getHeaders();
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.RESOURCE_CATEGORIES.DELETE_CATEGORY(id)}`, headers);
  }

  deleteResource(id:any): Observable<void> {
    const headers = this.getHeaders();
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.RESOURCE_CATEGORIES.DELETE_RESOURCE(id)}`, headers);
  }


  uploadResource(data: any) {
    const headers = this.getHeadersFormData();
    const formData: any = new FormData();
    // Append scalar fields
   
    // Append upload date if provided
    // if (data.uploadDate) {
      formData.append('CategoryId', data.CategoryId);
    // }
  
    formData.append('FileName', data.FileName);
  
      // Append files
    // if (data.files && data.files.length > 0) {
    //   data.files.forEach((file: File) => {
        formData.append('File', data.File); // Add file name if necessary
      // });
    // }
  
  
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.RESOURCE_CATEGORIES.UPLOAD_RESOURCE}`, formData, headers);
  }
}
