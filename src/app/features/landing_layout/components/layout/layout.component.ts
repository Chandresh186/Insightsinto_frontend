import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';
import { catchError, finalize, of, tap } from 'rxjs';
import { LogoutService } from '../../../../core/services/logout.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ngbootstrapModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LayoutComponent {
  public  isNavActive = false;
  public isLightTheme = true;
  public lastSegment: any;
  public loading: boolean = false;
  private errorMessage: string | null = null; // To store error messages
  public isScrolled: boolean = false;

  currentRoute: string = '';

  constructor(private router: Router, private logoutService : LogoutService) {}

  toggleNav() {
    this.isNavActive = !this.isNavActive;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Check the page scroll position and add/remove the class
    this.isScrolled = window.scrollY > 10;
  }

  getCurrentYear() {
    return new Date().getFullYear();
  }

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    document.body.classList.toggle('light-theme', this.isLightTheme);
    document.body.classList.toggle('dark-theme', !this.isLightTheme);
  }

  detectRoutes(e: any) {
    var currentPath = this.router.url.split('/');
    // const isRouteIncluded = this.menuItems.some((item : any) => item.routeURL.includes(currentPath[currentPath.length - 1]));
    // if (isRouteIncluded) {
      this.lastSegment = currentPath[currentPath.length - 1];
      console.log(this.lastSegment)
    // } 
  }

  ngOnInit() {
      
  }

  isLoggedIn(): boolean {
    // Check if the user token or user details are present in localStorage or sessionStorage
    const token = localStorage.getItem('currentUser'); // Replace 'authToken' with your token key
    return !!token; // Returns true if the token exists, false otherwise
  }


  logOut() {
  
      const userId = JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId;
      
     const payload = {
      userId: userId,
      logoutDatetime: new Date().toISOString()
     }
  
      this.loading = true; // Set loading state to true while fetching data
    
      this.logoutService.logout(payload).pipe(
        tap((response: any) => {
          localStorage.removeItem("currentUser");
          localStorage.removeItem("messageCount");
          localStorage.removeItem("activeRoute")
  
       
        }),
        catchError((error) => {
          this.errorMessage = 'Error logout user.'; // Handle error message
          console.error('Error logout user.:', error);
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          window.location.reload();
        })
      ).subscribe();
    }
}
