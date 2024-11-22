import { Routes } from '@angular/router';

export const landingRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/layout.component').then(
        (component) => component.LayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/landing-page/landing-page.component').then(
            (component) => component.LandingPageComponent
          ),
      },
      {
        path: 'auth',
        loadComponent: () =>
          import('./components/auth/auth.component').then(
            (component) => component.AuthComponent
          ),
      },
      {
        path: 'forgot_password',
        loadComponent: () =>
          import('./components/forgot-password/forgot-password.component').then(
            (component) => component.ForgotPasswordComponent
          ),
      },
      {
        path: 'test_series',
        loadComponent: () =>
          import(
            '../pages/test-series-landing-page/test-series-landing-page.component'
          ).then((component) => component.TestSeriesLandingPageComponent),
      },

      // {
      //   path: 'payment',
      //   loadChildren: () => 
      //       import(
      //           '../payment/index'
      //       ).then((component) => component.paymentRoutes)
      // }
    ],
  },
 
];
