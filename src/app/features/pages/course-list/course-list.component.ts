import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { CourseService } from '../../../core/services/course.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, ngbootstrapModule, RouterModule],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent implements OnInit {
  public loading = false;
  private errorMessage: string | null = null;
  public allCourses: any = [];
  staticBaseUrl : any = environment.staticBaseUrl

  constructor(private courseService : CourseService, private _authService : AuthService) {}

  ngOnInit() {
    if(this.checkRole('admin') || this.checkRole('super admin') ) {
      this.loadAllCourses();
    } else {
      const userId = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.userId;
      this.loadUserAllCourses(userId);
    }
  }

  public checkRole(role: string): boolean {
    return this._authService.checkRole(role);
  }

   private loadAllCourses(): void {
        this.loading = true; // Set loading state to true while fetching data
      
        this.courseService.getAllCourses().pipe(
          tap((response: any) => {
            console.log(response)
            this.allCourses = response
           
            
          }),
          catchError((error) => {
            this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
            console.error('Error loading Daily editorials:', error);
            this.allCourses = []; 
            return of([]); // Return an empty array in case of an error
          }),
          finalize(() => {
            this.loading = false; // Reset loading state when the request is completed
          })
        ).subscribe();
      }


      private loadUserAllCourses(userId: any): void {
        this.loading = true; // Set loading state to true while fetching data
      
        this.courseService.getAllUserCourses(userId).pipe(
          tap((response: any) => {
           
            const courseIds = response.map((item: any) => item.id);
            
            this.courseService.setCourses(courseIds);
            this.allCourses = response
            
          }),
          catchError((error) => {
            this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
            console.error('Error loading Daily editorials:', error);
            this.allCourses = []; 
            return of([]); // Return an empty array in case of an error
          }),
          finalize(() => {
            this.loading = false; // Reset loading state when the request is completed
          })
        ).subscribe();
      }


      onDelete(id: any) {
        console.log(id)

        this.loading = true; // Set loading state to true while fetching data
      
        this.courseService.deleteCourse(id).pipe(
          tap((response: any) => {
            console.log(response)
            // this.allCourses = response
            
          }),
          catchError((error) => {
            this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
            console.error('Error loading Daily editorials:', error);
            // this.allCourses = []; 
            return of([]); // Return an empty array in case of an error
          }),
          finalize(() => {
            this.loading = false; // Reset loading state when the request is completed
            this.loadAllCourses();
          })
        ).subscribe();
      }
}
