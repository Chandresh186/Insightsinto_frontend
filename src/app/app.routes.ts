import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () =>
          import('./features/landing_layout/index').then((component) => component.landingRoutes),
    },
    {
        path: 'dash',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/dashboard_layout/index').then((component) => component.SidebarComponent),
        children: [
            {
              path: '',
              loadChildren: () =>
                import('./features/dashboard_layout/index').then((component) => component.dashboardRoutes),
            },
          ],
    },
    {
      path: 'payment',
      loadChildren: () => 
          import(
              './features/payment/index'
          ).then((component) => component.paymentRoutes)
    },
    {
        path: "**",
        redirectTo: '/'
        // pathMatch: 'full',
    }
];
