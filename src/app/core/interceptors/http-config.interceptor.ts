import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, map, throwError } from 'rxjs';
import { SpinnerService } from '../services/spinner.service';
import { SettingsService } from '../services/settings.service';

export const httpConfigInterceptor: HttpInterceptorFn = (req, next) => {
 
  // const spinner = inject(NgxSpinnerService);
  const spinnerService = inject(SpinnerService);

  spinnerService.show();
 


    return next(req).pipe(
      map((event: any) => {
        if(event instanceof HttpResponse){
       
        
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 500) {
          // route.navigateByUrl("/404-error");
        }
        return throwError(error);
      }),
      finalize(()=> {
          spinnerService.hide()
      
      })
    );

};
