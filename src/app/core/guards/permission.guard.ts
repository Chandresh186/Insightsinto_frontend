import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router); // Inject the Router
  const userRole = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.role;
  const requiredRoles = route.data['requiredRoles'];

  // if (requiredRoles && !requiredRoles.includes(userRole)) {
  //   switch (userRole) {
  //     case 'Admin':
  //       router.navigate(['/users']);
  //       router.navigate(['/user-manager-mapping'])
  //       break;
  //     case 'Super admin':
  //       this.router.navigate(['/empemployess_list']);
  //       break;
  //     case 'Company':
  //       this.router.navigate(['/manager-company-mapping'])
  //       break;
  //     default:
  //       this.router.navigate(['/']);
  //       break;
  //   }
  //   return false;
  // }

  return true;
};


