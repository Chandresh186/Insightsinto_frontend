import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router); // Inject the Router
  const userRole = JSON.parse(localStorage.getItem('currentUser') as string)?.response?.role;
  const requiredRoles = route.data['requiredRoles'];


  // if (!userRole) {
  //   // Redirect to login if no user role is found
  //   router.navigate(['/']);
  //   return false;
  // }

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    // Redirect to respective dashboards if the user doesn't have the required role
    if (userRole === 'Admin') {
      // router.navigate(['/dash/test-series']);
      router.navigate(['/dash', 'dashboard']);
    } else if (userRole === 'User') {
      router.navigate(['/dash']);
    } else {
      router.navigate(['/']); // Fallback route
    }
    return false;
  }

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


