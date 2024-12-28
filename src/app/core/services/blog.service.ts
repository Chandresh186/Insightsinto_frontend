import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
private baseUrl = environment.URL
  constructor(private httpService: HttpService<any>) { }

   // Create a new category (POST)
   createBlog(data: any): Observable<any> {

    const formData: any = new FormData();

    formData.append('Title', data.title);
    formData.append('BlogContent', data.content);
    formData.append('Description', data.description);

    if (data.tags && data.tags.length > 0) {
      formData.append('Tags', JSON.stringify( data.tags)); // Append each topic individually
    }

    // Append files
    if (data.coverImage && data.coverImage.length > 0) {
      data.coverImage.forEach((img: File) => {
        formData.append('CoverImage', img, img.name); // Add file name if necessary
      });
    }

    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.Blogs.CREATE_BLOG}`, formData);
  }

  // Get all categories (GET)
  getBlogs(): Observable<any> {
    return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.Blogs.GET_ALL_BLOGS}`);
  }

  // Get a category by its ID (GET)
  getBlogById(id: any): Observable<any> {
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.Blogs.GET_BLOG_BY_ID(id)}` );
  }

  // Update a category (PUT)
  updateBlog(id: any, data: any): Observable<any> {
    const formData: any = new FormData();

    formData.append('Title', data.title);
    formData.append('BlogContent', data.content);
    formData.append('Description', data.description);

    if (data.tags && data.tags.length > 0) {
      formData.append('Tags', JSON.stringify( data.tags)); // Append each topic individually
    }

    // Append files
    if (Array.isArray(data.coverImage) && data.coverImage.length > 0) {
      data.coverImage.forEach((img: File) => {
        formData.append('CoverImage', img, img.name); // Add file name if necessary
      });
    }

   
    return this.httpService.update(`${this.baseUrl}${API_CONSTANTS.Blogs.UPDATE_BLOG_BY_ID(id)}`, formData);
  }

  // Delete a category (DELETE)
  deleteBlog(id:any): Observable<void> {
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.Blogs.DELETE_BLOG_BY_ID(id)}`);
  }
}
