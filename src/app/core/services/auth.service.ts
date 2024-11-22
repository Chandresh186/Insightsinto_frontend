import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { API_CONSTANTS } from '../constants/api.constant';
import { registerRequest } from '../models/interface/register_request.interface';
import { loginRequest } from '../models/interface/login_request.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.URL
  
  constructor(private httpService: HttpService<any>) { }

    // Register
    register(data: registerRequest): Observable<any> {
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.REGISTER}`;
      return this.httpService.post(url, data);
    }
  
    // Login method
    login(data: loginRequest): Observable<any> {
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.LOGIN}`;
      return this.httpService.post(url, data);
    }


    // Logout method
    logout(): Observable<any> {
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.LOGOUT}`;
      return this.httpService.post(url, {});
    }
}
