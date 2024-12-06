import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
    // {
    //     path: '',
    //     loadComponent: () =>
    //         import('./components/sidebar/sidebar.component').then(
    //             (component) => component.SidebarComponent
    //         ),
    // },
    {
        path: '',
        loadComponent: () =>
            import('../pages/dashboard/dashboard.component').then(
                (component) => component.DashboardComponent
            ),
    },

    {
        path: 'categories',
        loadComponent: () =>
            import('../pages/categories/categories.component').then(
                (component) => component.CategoriesComponent
            ),
    },
    {
        path: 'test-series',
        loadChildren: () =>
            import('../test/index').then(
                (component) => component.testRoutes
            ),
    },
    {
        path: 'settings',
        loadComponent: () =>
            import('../settings/index').then(
                (component) => component.SettingsComponent
            ),
    },


    {
        path: 'series-details/:id',
        loadComponent: () =>
            import('../pages/user-testseries-details/user-testseries-details.component').then(
                (component) => component.UserTestseriesDetailsComponent
            ),
    },
    
    {
        path: 'test/:id/:testSeriesId',
        loadComponent: () =>
            import('../pages/attempt-test/attempt-test.component').then(
                (component) => component.AttemptTestComponent
            ),
    },


    {
        path: 'dashboard',
        loadComponent: () =>
            import('../pages/admin-dashboard/admin-dashboard.component').then(
                (component) => component.AdminDashboardComponent
            ),
    },

    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
    }
]