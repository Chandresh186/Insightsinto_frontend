import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { last } from 'rxjs';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';
import { AuthService } from '../../../../core/services/auth.service';
import { SignalRService } from '../../../../core/services/signal-r.service';
import { ToastrService } from 'ngx-toastr';

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SidebarComponent {
public isSidebarOpen: boolean = false;
public messages: any[] = [];
public messageCount = 0;
public isSingleRNotifationVisible = false;
public menuItems: NavItem[] = [
  { title: 'Dashboard', routeURL: '../dash', icon: 'assets/icons/home.png'},
  { title: 'User Dashboard', routeURL: 'user-dashboard', icon: 'assets/icons/dashboard.png'},
  { title: 'Admin Dashboard', routeURL: 'dashboard', icon: 'assets/icons/dashboard.png'},
  { title: 'Categories', routeURL: 'categories', icon: 'assets/icons/category.png'},
  { title: 'Test', routeURL: 'test-series', icon: 'assets/icons/test.png' },
  { title: 'Daily Editorial', routeURL: 'daily-editorial', icon: 'assets/icons/pen-tool (1).png' },
  { title: 'Blogs', routeURL: 'blogs', icon: 'assets/icons/blog.png' },
  { title: 'Promo Code', routeURL: 'promocode', icon: 'assets/icons/coupon.png' },
  // { title: 'Users', routeURL: 'users', icon: 'assets/icons/user-icon.svg' },
  // { title: 'Employees', routeURL: 'employess_list', icon: 'assets/icons/employees.svg' },
  // { title: 'Manager Assigned To Employee', routeURL: 'user-manager-mapping', icon: 'assets/icons/employees.svg' },
  // { title: 'Employee Assigned To Group', routeURL: 'user-group-mapping', icon: 'assets/icons/employees.svg' },
  { title: 'Settings', routeURL: 'settings', icon: 'assets/icons/setting.png' },
];

public userDetails : any;

constructor(private _authService : AuthService, private _signalRService: SignalRService, private toastr: ToastrService) {}

public  toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}

ngOnInit() {
  this.userDetails = JSON.parse(localStorage.getItem('currentUser')!).response;

  this.notificationMessage();
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
    (error) => { }
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
      this.toastr.error("Failed to update notification status.", "Error", {
        progressBar: true
      }) ;
    }
  );
}

signOut() {

}


   @HostListener('document:click', ['$event.target'])
    onClickOutside(targetElement: HTMLElement): void {
      if (targetElement.id !== 'notification' && targetElement.id !== 'notification-bell') {
        this.isSingleRNotifationVisible = false;
      }
    }
}
