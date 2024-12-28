import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService<T> {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

    // Create (POST)
    // post(url: string, data: T): Observable<T> {
    //   return this.http.post<T>(url, data, { headers: this.headers });
    // }

    post<T>(url: string, data: T): Observable<T> {
      // Check if the data is an instance of FormData
      if (data instanceof FormData) {
        // If it is FormData, don't set 'Content-Type' header because browser will handle it
        return this.http.post<T>(url, data);
      } else {
        // If it's not FormData, use the existing headers for regular JSON payload
        return this.http.post<T>(url, data, { headers: this.headers });
      }
    }
    
  
    // Read (GET)
    get(url: string): Observable<T[]> {
      return this.http.get<T[]>(url);
    }
  
    // Read Single Item by ID (GET)
    getById(url: string): Observable<T> {
      return this.http.get<T>(`${url}`);
    }
  
    // Update (PUT)
    update(url: string, data: T): Observable<T> {
       // Check if the data is an instance of FormData
       if (data instanceof FormData) {
        // If it is FormData, don't set 'Content-Type' header because browser will handle it
        return this.http.put<T>(url, data);
      } else {
        // If it's not FormData, use the existing headers for regular JSON payload
        return this.http.put<T>(`${url}`, data, { headers: this.headers });
      }
      
    }
  
    // Delete (DELETE)
    delete(url: string): Observable<void> {
      return this.http.delete<void>(`${url}`);
    }

}
