import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';
import { LogoutService } from '../../../../core/services/logout.service';
import { catchError, finalize, of, tap } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ngbootstrapModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeaderComponent {
  public loading: boolean = false;
  private errorMessage: string | null = null; // To store error messages

  constructor(private logoutService : LogoutService, private router: Router) {}


  logOut() {

    const userId = JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId;
    
   const payload = {
    userId: userId,
    logoutDatetime: new Date().toISOString()
   }

    this.loading = true; // Set loading state to true while fetching data
  
    this.logoutService.logout(payload).pipe(
      tap((response: any) => {
        console.log('User loggedOut successfully:', response);
        localStorage.removeItem("currentUser");

     
      }),
      catchError((error) => {
        this.errorMessage = 'Error logout user.'; // Handle error message
        console.error('Error logout user.:', error);
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
        this.router.navigateByUrl('/')
      })
    ).subscribe();
  }
}
