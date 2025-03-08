import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';
import { LogoutService } from '../../../../core/services/logout.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { SignalRService } from '../../../../core/services/signal-r.service';
import { ToastrService } from 'ngx-toastr';

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
  public userDetails: any;
  public messages: any[] = [];
  public messageCount = 0;
  public isSingleRNotifationVisible = false;

  constructor(private logoutService : LogoutService, private router: Router, private _signalRService: SignalRService, private toastr: ToastrService) {}

  ngOnInit() {
    this.userDetails = JSON.parse(localStorage.getItem('currentUser')!).response;
      this.notificationMessage();
    this._signalRService.startMessage$.subscribe(() => {
      this.notificationMessage();
    });
  }

  singleRNotification() {
      this.isSingleRNotifationVisible = true;
  }

  

  notificationMessage() {
    this._signalRService.getUserNotification().subscribe(
      (res) => {
        this.messages = [];
        res?.forEach((item: any) => {
          // Check for unread messages where receiverEmail matches user's email
          if (item?.receiverEmail === this.userDetails?.email && !item.isRead) {
            this.messages.push(item);
            // Update the count of unread messages
            this.messageCount = this.messages.length;
          }
        });
   
      },
      (error) => {
      }
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
        // this.router.navigateByUrl('/')
        window.location.reload();
      })
    ).subscribe();
  }




    @HostListener('document:click', ['$event.target'])
    onClickOutside(targetElement: HTMLElement): void {
      if (targetElement.id !== 'notification' && targetElement.id !== 'notification-bell') {
        this.isSingleRNotifationVisible = false;
      }
    }
}
