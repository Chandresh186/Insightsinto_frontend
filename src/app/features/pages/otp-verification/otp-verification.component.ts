import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.scss',
})
export class OtpVerificationComponent implements OnInit{
  otp: string = ''; // Holds the OTP value
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
     // Start the timer when the component is initialized
  }

    // Start the timer function
    

  isNumberKey(evt: any) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
  }

  getEmailId() {
    return this.route.snapshot.params['email'];
  }

  // Handle OTP form submission
  onSubmit() {
    console.log('OTP Submitted: ', this.otp);
    const obj = {
      email: this.getEmailId(),
      otp: this.otp
    };

    console.log(obj);
    this.loading = true; // Set loading state
    this.authService
      .validateOTP(obj)
      .pipe(
        tap((response) => {
          console.log(response);
          if(response.success) {
            console.log('Resending OTP...');
            this.toastr.success(response.message, "success", {
              progressBar: true
            }) ;
            this.router.navigateByUrl('auth')
          }
        }),
        catchError((error) => {
          this.toastr.error(error.error.message, "Error", {
            progressBar: true
          }) ;
          this.errorMessage = 'validation failed. Please try again.'; // Handle error
          console.error('validation error:', error);
          return of(null); // Return a default value to continue the stream
        }),
        finalize(() => {
          this.otp = '';
          this.loading = false; // Reset loading state
          //  this.modalService.dismissAll();
        })
      )
      .subscribe();
  }

  resendMail() {
    const obj = {
      email: this.getEmailId(),
    };

    console.log(obj);
    this.loading = true; // Set loading state
    this.authService
      .resendOTP(obj)
      .pipe(
        tap((response) => {
          console.log(response);
          if(response.success) {
            console.log('Resending OTP...');
          }
        }),
        catchError((error) => {
          this.errorMessage = 'Registration failed. Please try again.'; // Handle error
          console.error('Registration error:', error);
          return of(null); // Return a default value to continue the stream
        }),
        finalize(() => {
          this.otp = '';
          this.loading = false; // Reset loading state
          //  this.modalService.dismissAll();
        })
      )
      .subscribe();
  }
}
