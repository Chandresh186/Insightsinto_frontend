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
]