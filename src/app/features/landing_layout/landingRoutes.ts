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

      {
        path: 'editorial',
        loadComponent: () => 
            import(
                '../pages/daily-editorial-landing-page/daily-editorial-landing-page.component'
            ).then((component) => component.DailyEditorialLandingPageComponent)
      },
      {
        path: 'blog-details/:id',
        loadComponent: () => 
            import(
                '../pages/blog-details/blog-details.component'
            ).then((component) => component.BlogDetailsComponent)
      },
      {
        path: 'blogs',
        loadComponent: () => 
            import(
                '../pages/blogs-list/blogs-list.component'
            ).then((component) => component.BlogsListComponent)
      },
      {
        path: 'terms-and-conditions',
        loadComponent: () => 
            import(
                '../pages/terms-and-conditions/terms-and-conditions.component'
            ).then((component) => component.TermsAndConditionsComponent)
            
      },
      {
        path: 'privacy-policy',
        loadComponent: () => 
            import(
                '../pages/privacy-policy/privacy-policy.component'
            ).then((component) => component.PrivacyPolicyComponent)
      },
      {
        path: 'refund-policy',
        loadComponent: () => 
            import(
                '../pages/refund-policy/refund-policy.component'
            ).then((component) => component.RefundPolicyComponent)
      },
      {
        path: 'contactus',
        loadComponent: () => 
            import(
                '../pages/contact-us/contact-us.component'
            ).then((component) => component.ContactUsComponent)
      }
    ],
  },
 
];
