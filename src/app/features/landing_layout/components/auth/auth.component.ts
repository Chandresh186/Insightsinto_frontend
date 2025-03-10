import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../../core/services/auth.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordPatternValidator, patternValidator } from '../../../../shared/helper.service';
import { registerRequest } from '../../../../core/models/interface/register_request.interface';
import { loginRequest } from '../../../../core/models/interface/login_request.interface';
import { validationErrorMessage } from '../../../../core/constants/validation.constant';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AuthComponent implements OnInit{

  public isRegister: boolean = false;
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public validationErrorMessage = validationErrorMessage;
  public hidePassword = true;

  public signUpForm!: FormGroup;
  public loginForm!: FormGroup;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService, private cdr: ChangeDetectorRef) {}


  ngOnInit() {
    this.isRegister = JSON.parse(localStorage.getItem('isRegister')?? 'false')  ;
    localStorage.removeItem('isRegister');
    this.signUpForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.compose([Validators.required, patternValidator()])),
      userType: new FormControl('bdc6804c-3669-4463-92e2-876d06bb3fd2'),
    });

    this.loginForm =  new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.compose([Validators.required, patternValidator()])),
    });
  }

  get signUpControl() {
    return this.signUpForm.controls;
  }

  get loginFormControl() {
    return this.loginForm.controls;
  }


  enforceLowerCase(event: Event) {
    const input = event.target as HTMLInputElement; // Get the input element
    const currentValue = input.value.toLowerCase(); // Get the current value of the input
  
    // Convert the entire input value to lowercase
    const newValue = currentValue.toLowerCase();
  
    // Update the input value with the lowercase version
    input.value = newValue.toLowerCase();
    // Emit the new value to the form control (if using reactive forms)
    if(this.isRegister) {
      this.signUpControl['email'].setValue(newValue, { emitEvent: false });
    } else {
      this.loginFormControl['email'].setValue(newValue, { emitEvent: false });
    }
    
    // Manually trigger change detection
    this.cdr.detectChanges();
  

  }

  onInputChange(event: Event): void {
    const numericCharCheckMark = document.getElementById('numeric-char-check') as any;
    const uppercaseCharCheckMark = document.getElementById('uppercase-char-check') as any;
    const specialCharCheckMark = document.getElementById('special-char-check') as any;
    const minLengthCheckMark = document.getElementById('min-length-check') as any; 
    const passwd = event.target as any;
    const numericCharCheck = /.*\d.*/.test(passwd);
    const uppercaseCharCheck = /.*[A-Z].*/.test(passwd);
    const specialCharCheck = /.*[!@#$%^&?*].*/.test(passwd);


    const minLengthCheck = passwd.length >= 8;
  
    if(numericCharCheck) {
      numericCharCheckMark.style.filter = 'grayscale(0)';
    }
    else {
      numericCharCheckMark.style.filter = 'grayscale(1)';
    }

    if(uppercaseCharCheck) {
      uppercaseCharCheckMark.style.filter = 'grayscale(0)';
    }
    else {
      uppercaseCharCheckMark.style.filter = 'grayscale(1)';
    }

    if(specialCharCheck) {
      specialCharCheckMark.style.filter = 'grayscale(0)';
    }
    else {
      specialCharCheckMark.style.filter = 'grayscale(1)';
    }

    if(minLengthCheck) {
      minLengthCheckMark.style.filter = 'grayscale(0)';
    }
    else {
      minLengthCheckMark.style.filter = 'grayscale(1)';
    }
  }






  registerUser() {
    const registerData: registerRequest = this.signUpForm.value;

    this.loading = true; // Set loading state
    this.authService.register(registerData).pipe(
      tap(response => {
        this.isRegister = !this.isRegister;
        this.signUpForm.reset();
      }),
      catchError(error => {
        this.toastr.error(error.error.message, "Error", {
          progressBar: true
        }) ;
        this.errorMessage = 'Registration failed. Please try again.'; // Handle error
        console.error('Registration error:', error);
        return of(null); // Return a default value to continue the stream
      }),
      finalize(() => {
        this.loading = false; // Reset loading state
      })
    ).subscribe();
  }


  loginUser() {
    const loginData: loginRequest = this.loginForm.value;

    this.loading = true; // Set loading state
    this.authService.login(loginData).pipe(
      tap(response => {
        if(response.status) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.router.navigateByUrl('/dash');
        }
      }),
      catchError(error => {
        this.toastr.error(error.error.message, "Error", {
          progressBar: true
        }) ;
        this.errorMessage = 'Login failed. Please check your credentials.';
        console.error('Login error:', error);
        if(error && error.error.status === false && error.error.message === "Please verify your email before logging in.") {
          this.router.navigateByUrl(`/validate/${loginData.email}`)
        }
       
        return of(null); // Return a default value to continue the stream
      }),
      finalize(() => {

        this.loading = false; // Reset loading state
       
      })
    ).subscribe();
  }

}
