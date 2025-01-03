import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { API_CONSTANTS } from '../constants/api.constant';
import { registerRequest } from '../models/interface/register_request.interface';
import { loginRequest } from '../models/interface/login_request.interface';
import { INSIGHT_INTO_ROLE, PermissionEnum } from '../enums/roles';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.URL
  private currentUserPermissions: any;
  constructor(private httpService: HttpService<any>) { }

  private getHeaders(): HttpHeaders {
    const token: string = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

    // Register
    register(data: registerRequest): Observable<any> {
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.REGISTER}`;
      return this.httpService.post(url, data);
    }

    registerAndLogin(data: registerRequest): Observable<any> {
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.REGISTER_AND_LOGIN}`;
      return this.httpService.post(url, data);
    }
  
    // Login method
    login(data: loginRequest): Observable<any> {
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.LOGIN}`;
      return this.httpService.post(url, data);
    }


    // Logout method
    logout(): Observable<any> {
      const headers = this.getHeaders();
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.LOGOUT}`;
      return this.httpService.post(url, {}, headers);
    }


    checkPermission(permission: any): boolean {
      if (!permission) return false;
      const rolePermissionsMap: Record<any, PermissionEnum[]> = {
        [INSIGHT_INTO_ROLE.Admin]: [PermissionEnum.Settings, PermissionEnum.Categories, PermissionEnum.Test, PermissionEnum.DailyEditorial, PermissionEnum.AdminDashboard, PermissionEnum.Blogs, PermissionEnum.PromoCode],
        [INSIGHT_INTO_ROLE.User]: [PermissionEnum.Settings, PermissionEnum.Dashboard, PermissionEnum.UserDashboard, PermissionEnum.DailyEditorial, PermissionEnum.Blogs],
  
      };
      const userRole = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.role;
      this.currentUserPermissions = rolePermissionsMap[userRole] || [];
      return this.currentUserPermissions.includes(permission);
    }


    checkRole(userRoleName: string): boolean {
      if (!userRoleName) return false;
  
      // Retrieve the current user's information from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') as string)?.response;
  
      // Check if the provided username matches the logged-in user's username
      return currentUser?.role.toLowerCase() === userRoleName.toLowerCase();
    }
}
