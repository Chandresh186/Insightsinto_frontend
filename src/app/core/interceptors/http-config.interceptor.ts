import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, map, throwError } from 'rxjs';
import { SpinnerService } from '../services/spinner.service';

export const httpConfigInterceptor: HttpInterceptorFn = (req, next) => {
 
  // const spinner = inject(NgxSpinnerService);
  const spinnerService = inject(SpinnerService);

  spinnerService.show();
 


    return next(req).pipe(
      map((event: any) => {
        if(event){
          // toastr.success(`Request successful: ${event.message}`)
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        // toastr.error(`Request failed: ${error.message}`)
        if (error.status === 500) {
          // route.navigateByUrl("/404-error");
        }
        return throwError(error);
      }),
      finalize(()=> {
        // setTimeout(() => {
          spinnerService.hide()
        // }, 2000);
      })
    );

};
