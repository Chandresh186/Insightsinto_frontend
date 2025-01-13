import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, map, throwError } from 'rxjs';

export const httpConfigInterceptor: HttpInterceptorFn = (req, next) => {
  // const route = inject(Router);
  const spinner = inject(NgxSpinnerService);
  // const toastr = inject(ToastrService)
  // const token: string =JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
  spinner.show();
  // toastr.info('Request initiated');
  // if (token)
  //   req= req.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });


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
        setTimeout(() => {
          spinner.hide()
        }, 2000);
      })
    );


  // return next(req);
};
