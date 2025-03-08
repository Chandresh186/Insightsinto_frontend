import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';

@Component({
  selector: 'app-user-permissions',
  standalone: true,
  imports: [CommonModule, ngbootstrapModule, RouterLink],
  templateUrl: './user-permissions.component.html',
  styleUrl: './user-permissions.component.scss'
})
export class UserPermissionsComponent implements OnInit {
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages

  public permissionsList:any[] = [];

  // Selected permissions array
  public selectedPermissions: string[] = [];

  constructor(private route : ActivatedRoute, private authService : AuthService, private modalService: NgbModal, private router: Router) {}

  ngOnInit() {
    this.loadAllUserPermissions(this.getUserId());
    this.loadAllPermissions();
  }

  getUserId() {
    return this.route.snapshot.params['id']
  }

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    console.log(event)
    console.log(checkbox.value)
    const value = checkbox.value;


    if (checkbox.checked) {
      this.selectedPermissions.push(value);
    } else {
      const index = this.selectedPermissions.indexOf(value);
      if (index > -1) {
        this.selectedPermissions.splice(index, 1);
      }
    }

    console.log('Selected Permissions:', this.selectedPermissions);
  }


   loadAllPermissions() {
      
   
       this.loading = true; // Set loading state
       this.authService.getAllPermissions().pipe(
         tap(response => {
          console.log(response)
          this.permissionsList = response
          // this.allRoles = response.filter(role => role.roleId !== "34af8a6f-d7d4-45a3-b6ea-201dfe13d3e0") //role.roleId !== "bdc6804c-3669-4463-92e2-876d06bb3fd2" && 
          // console.log(this.allRoles)
          //  this.signUpForm.reset();
         }),
         catchError(error => {
           this.errorMessage = 'Registration failed. Please try again.'; // Handle error
           console.error('Registration error:', error);
           return of(null); // Return a default value to continue the stream
         }),
         finalize(() => {
           this.loading = false; // Reset loading state
          //  this.modalService.dismissAll();
         })
       ).subscribe();
  }


  createOrUpdateUserPermissions() {
    const obj = {
      userId: this.getUserId(),
      moduleNames :this.selectedPermissions
    }
    console.log(obj)
    this.loading = true; // Set loading state
    this.authService.createOrUpdateUserPermission(obj).pipe(
      tap(response => {
       console.log(response)
      //  this.permissionsList = response
       // this.allRoles = response.filter(role => role.roleId !== "34af8a6f-d7d4-45a3-b6ea-201dfe13d3e0") //role.roleId !== "bdc6804c-3669-4463-92e2-876d06bb3fd2" && 
       // console.log(this.allRoles)
       //  this.signUpForm.reset();
      }),
      catchError(error => {
        this.errorMessage = 'Registration failed. Please try again.'; // Handle error
        console.error('Registration error:', error);
        return of(null); // Return a default value to continue the stream
      }),
      finalize(() => {
        this.loadAllUserPermissions(this.getUserId())
        this.loading = false; // Reset loading state
       //  this.modalService.dismissAll();
      })
    ).subscribe();
  }




  loadAllUserPermissions(userId: any) {
      
   
    this.loading = true; // Set loading state
    this.authService.getAllUserPermissions(userId).pipe(
      tap((response: any) => {
        this.selectedPermissions = response.data.map((q: any) => q.moduleName)
      //  console.log(data)
      //   = response.data.filter((q: any) => q.moduleName)
       // this.allRoles = response.filter(role => role.roleId !== "34af8a6f-d7d4-45a3-b6ea-201dfe13d3e0") //role.roleId !== "bdc6804c-3669-4463-92e2-876d06bb3fd2" && 
       // console.log(this.allRoles)
       //  this.signUpForm.reset();
      }),
      catchError(error => {
        this.errorMessage = 'Registration failed. Please try again.'; // Handle error
        console.error('Registration error:', error);
        return of(null); // Return a default value to continue the stream
      }),
      finalize(() => {
        this.loading = false; // Reset loading state
       //  this.modalService.dismissAll();
      })
    ).subscribe();
}
}
