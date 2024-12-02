import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { last } from 'rxjs';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';

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
public menuItems: NavItem[] = [
  { title: 'Dashboard', routeURL: '../dash', icon: 'assets/icons/dashboard.png'},
  { title: 'Categories', routeURL: 'categories', icon: 'assets/icons/category.png'},
  { title: 'Test', routeURL: 'test-series', icon: 'assets/icons/test.png' },
  // { title: 'Admin Dashboard', routeURL: 'admin-dashboard', icon: 'assets/icons/chart.svg' },
  // { title: 'Analytics', routeURL: 'analytics-reporting', icon: 'assets/icons/timer.svg' },
  // { title: 'Users', routeURL: 'users', icon: 'assets/icons/user-icon.svg' },
  // { title: 'Employees', routeURL: 'employess_list', icon: 'assets/icons/employees.svg' },
  // { title: 'Manager Assigned To Employee', routeURL: 'user-manager-mapping', icon: 'assets/icons/employees.svg' },
  // { title: 'Employee Assigned To Group', routeURL: 'user-group-mapping', icon: 'assets/icons/employees.svg' },
  { title: 'Settings', routeURL: 'settings', icon: 'assets/icons/setting.png' },
];

public userDetails = {
  firstName: "Admin",
  lastName : "Admin",
  role: "Admin",

}

public  toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}

public checkPermission(t: any) {

}

signOut() {

}
}
