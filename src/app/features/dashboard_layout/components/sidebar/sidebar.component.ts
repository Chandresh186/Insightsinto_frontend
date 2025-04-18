import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, filter, finalize, last, of, tap } from 'rxjs';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';
import { AuthService } from '../../../../core/services/auth.service';
import { SignalRService } from '../../../../core/services/signal-r.service';
import { ToastrService } from 'ngx-toastr';
import { LogoutService } from '../../../../core/services/logout.service';
import { SettingsService } from '../../../../core/services/settings.service';

export interface NavItem {
  routeURL?: string;
  title: string;
  icon?: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [HeaderComponent, RouterModule, CommonModule, ngbootstrapModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarComponent {
  public isSidebarOpen: boolean = true;
  public messages: any[] = [];
  public messageCount = 0;
  public isSingleRNotifationVisible = false;
  public lastSegment: any;
  public currentRoute: any;
  public loading: boolean = false;
  private errorMessage: string | null = null; // To store error messages
  public menuItems: NavItem[] = [
    {
      title: 'Dashboard',
      routeURL: this.getDashboardRoute(),
      icon: 'assets/icons/dashboard.png',
    },
    // { title: 'User Dashboard', routeURL: 'user-dashboard', icon: 'assets/icons/dashboard.png'},
    // { title: 'Admin Dashboard', routeURL: 'dashboard', icon: 'assets/icons/dashboard.png'},
    {
      title: 'Categories',
      routeURL: 'categories',
      icon: 'assets/icons/category.png',
    },
    {
      title: 'Test Series',
      routeURL: this.getTestSeriesRoute(),
      icon: 'assets/icons/test-series.png',
    },
    { title: 'Test', routeURL: 'test-list', icon: 'assets/icons/test.png' },
    {
      title: 'Editorial',
      routeURL: 'daily-editorial',
      icon: 'assets/icons/pen-tool (1).png',
    },
    { title: 'Blogs', routeURL: 'blogs', icon: 'assets/icons/blog.png' },
    {
      title: 'Promo Code',
      routeURL: 'promocode',
      icon: 'assets/icons/coupon.png',
    },
    {
      title: 'Questions',
      routeURL: 'question-list',
      icon: 'assets/icons/questions.png',
    },
    {
      title: 'Courses',
      routeURL: 'course-list',
      icon: 'assets/icons/course.png',
    },
    { title: 'Users', routeURL: 'user-list', icon: 'assets/icons/user.png' },

    // { title: 'Employees', routeURL: 'employess_list', icon: 'assets/icons/employees.svg' },
    // { title: 'Manager Assigned To Employee', routeURL: 'user-manager-mapping', icon: 'assets/icons/employees.svg' },
    // { title: 'Employee Assigned To Group', routeURL: 'user-group-mapping', icon: 'assets/icons/employees.svg' },
    {
      title: 'YouTube Links',
      routeURL: 'Youtube-links',
      icon: 'assets/icons/youtube.png',
    },
    {
      title: 'Settings',
      routeURL: 'settings',
      icon: 'assets/icons/setting.png',
    },
  ];

  public userDetails: any;

  constructor(
    private logoutService: LogoutService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _signalRService: SignalRService,
    private toastr: ToastrService,
    public settingsService: SettingsService
  ) {}

  getTestSeriesRoute(): string {
    return JSON.parse(localStorage.getItem('currentUser')!).response?.role ===
      'User'
      ? 'user-testSeries'
      : 'test-series';
  }

  getDashboardRoute(): string {
    return JSON.parse(localStorage.getItem('currentUser')!).response?.role ===
      'User'
      ? 'dash'
      : 'dashboard';
  }

  public toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  public checkRole(role: string): boolean {
    return this._authService.checkRole(role);
  }

  ngOnInit() {
    this.userDetails = JSON.parse(
      localStorage.getItem('currentUser')!
    ).response;

    this.notificationMessage();
    this.lastSegment = localStorage.getItem('activeRoute');
  }

  detectRoutes(e: any) {
    this.settingsService.fetchSettings();
    var currentPath = this.router.url.split('/');
    const isRouteIncluded = this.menuItems.some((item: any) =>
      item.routeURL.includes(currentPath[currentPath.length - 1])
    );
    this.currentRoute = currentPath[currentPath.length - 1];
    // console.log(currentPath[currentPath.length - 1])
    if (isRouteIncluded) {
      this.lastSegment = currentPath[currentPath.length - 1];
      localStorage.setItem('activeRoute', this.lastSegment);
    }
  }

  public checkPermission(permission: string): boolean {
    return this._authService.checkPermission(permission);
  }

  singleRNotification() {
    this.isSingleRNotifationVisible = !this.isSingleRNotifationVisible;
  }

  notificationMessage() {
    this._signalRService.getUserNotification().subscribe(
      (res) => {
        this.messages = [];
        res?.forEach((item: any) => {
          if (item?.receiverEmail === this.userDetails?.email && !item.isRead) {
            this.messages.push(item);
            this.messageCount = this.messages.length;
          }
        });
      },
      (error) => {}
    );
  }

  readAllNotification() {
    this._signalRService.readUserNotification().subscribe(
      (res) => {
        if (res?.status) {
          this.notificationMessage();
        }
      },
      () => {
        this.toastr.error('Failed to update notification status.', 'Error', {
          progressBar: true,
        });
      }
    );
  }

  signOut() {}

  logOut() {
    const userId = JSON.parse(localStorage.getItem('currentUser') || 'null')
      .response.userId;

    const payload = {
      userId: userId,
      logoutDatetime: new Date().toISOString(),
    };

    this.loading = true; // Set loading state to true while fetching data

    this.logoutService
      .logout(payload)
      .pipe(
        tap((response: any) => {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('messageCount');
          localStorage.removeItem('activeRoute');
        }),
        catchError((error) => {
          this.errorMessage = 'Error logout user.'; // Handle error message
          console.error('Error logout user.:', error);
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          // this.router.navigateByUrl('/')
          window.location.reload();
        })
      )
      .subscribe();
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement): void {
    if (
      targetElement.id !== 'notification' &&
      targetElement.id !== 'notification-bell'
    ) {
      this.isSingleRNotifationVisible = false;
    }
  }
}
