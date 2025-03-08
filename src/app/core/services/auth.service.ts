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

  
    getAllUsers(): Observable<any[]> {
      const headers = this.getHeaders();
      return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.USERS.GET_ALL_USERS}`, headers);
    }

    createOrUpdateUserPermission(data: any): Observable<any> {
      const headers = this.getHeaders();
      const url = `${this.baseUrl}${API_CONSTANTS.PERMISSIONS.CREATE_OR_UPDATE_PERMSSSIONS}`;
      return this.httpService.post(url, data, headers);
    }

    resendOTP(data: any): Observable<any> {
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.RESEND_OTP}`;
      return this.httpService.post(url, data);
    }

    validateOTP(data: any): Observable<any> {
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.VALIDATE_OTP}`;
      return this.httpService.post(url, data);
    }

    getAllPermissions(): Observable<any[]> {
      const headers = this.getHeaders();
      return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.PERMISSIONS.GET_ALL_PERMISSIONS}`, headers);
    }

    getAllUserPermissions(userId: any): Observable<any[]> {
      const headers = this.getHeaders();
      return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.PERMISSIONS.GET_ALL_USER_PERMISSIONS(userId)}`, headers);
    }


    getAllRoles(): Observable<any[]> {
      const headers = this.getHeaders();
      return this.httpService.get(`${this.baseUrl}${API_CONSTANTS.Roles.GET_ALL_ROLES}`, headers);
    }


    deleteUserByuserId(userId : any ): Observable<void> {
      const headers = this.getHeaders();
      return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.USERS.DELETE_USERS(userId)}`, headers);
    }

    // Logout method
    logout(): Observable<any> {
      const headers = this.getHeaders();
      const url = `${this.baseUrl}${API_CONSTANTS.AUTH.LOGOUT}`;
      return this.httpService.post(url, {}, headers);
    }


    checkPermission(permission: any): boolean {
      if (!permission) return false;
      const currentUserPermissions = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.userPermissions;
      // console.log(currentUserPermissions)
      const rolePermissionsMap: Record<any, PermissionEnum[]> = {
        [INSIGHT_INTO_ROLE.SupperAdmin]: currentUserPermissions,
        [INSIGHT_INTO_ROLE.Admin]: currentUserPermissions,
        [INSIGHT_INTO_ROLE.User]: currentUserPermissions,
  
      };
      // [PermissionEnum.Settings, PermissionEnum.Categories, PermissionEnum.TestSeries, PermissionEnum.Test, PermissionEnum.DailyEditorial, PermissionEnum.AdminDashboard, PermissionEnum.Blogs, PermissionEnum.PromoCode, PermissionEnum.Question, PermissionEnum.Courses,PermissionEnum.Users]
      // [PermissionEnum.Settings, PermissionEnum.Categories, PermissionEnum.TestSeries, PermissionEnum.Test, PermissionEnum.DailyEditorial, PermissionEnum.AdminDashboard, PermissionEnum.Blogs, PermissionEnum.PromoCode, PermissionEnum.Question, PermissionEnum.Courses, PermissionEnum.Users]
      // [PermissionEnum.Settings, PermissionEnum.Dashboard, PermissionEnum.DailyEditorial, PermissionEnum.Blogs]
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
