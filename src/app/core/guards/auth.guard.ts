import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';


export const authGuard: CanActivateFn = (route, state) => {
  // debugger;
  const router = inject(Router); // Inject the Router
  const token = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.token;
  if (token) return true;
  else {
    router.navigate(['/']);
    return false;
  }
};
