import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>) { }

   // Create a new category (POST)
   createCategory(data: any): Observable<any> {
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.CREATE_CATEGORY}`, data);
  }

  // Get all categories (GET)
  getCategories(): Observable<any> {
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.GET_ALL_CATEGORIES}`);
  }

  getallmappedCategories(): Observable<any> {
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.GET_ALL_MAPPED_CATEGORIES}`);
  }

  // Get a category by its ID (GET)
  getCategoryById(id: any): Observable<any> {
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.GET_CATEGORY_BY_ID(id)}` );
  }

  // Update a category (PUT)
  updateCategory(id: any, data: any): Observable<any> {
    return this.httpService.update(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.UPDATE_CATEGORY(id)}`, data);
  }

  // Delete a category (DELETE)
  deleteCategory(id:any): Observable<void> {
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.CATEGORIES.DELETE_CATEGORY(id)}`);
  }
}
