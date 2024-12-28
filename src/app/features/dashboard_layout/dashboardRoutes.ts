import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

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
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['User'] }, 
        loadComponent: () =>
            import('../pages/dashboard/dashboard.component').then(
                (component) => component.DashboardComponent
            ),
        
    },

    {
        path: 'categories',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Admin'] }, 
        loadComponent: () =>
            import('../pages/categories/categories.component').then(
                (component) => component.CategoriesComponent
            ),
    },
    {
        path: 'test-series',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Admin'] }, 
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
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['User'] }, 
        loadComponent: () =>
            import('../pages/user-testseries-details/user-testseries-details.component').then(
                (component) => component.UserTestseriesDetailsComponent
            ),
    },
    
    {
        path: 'test/:id/:testSeriesId',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['User'] }, 
        loadComponent: () =>
            import('../pages/attempt-test/attempt-test.component').then(
                (component) => component.AttemptTestComponent
            ),
    },
    {
        path: 'dashboard',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Admin'] }, 
        loadComponent: () =>
            import('../pages/admin-dashboard/admin-dashboard.component').then(
                (component) => component.AdminDashboardComponent
            ),
    }, 
    {
        path: 'user-dashboard',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['User'] }, 
        loadComponent: () =>
            import('../pages/user-dashboard/user-dashboard.component').then(
                (component) => component.UserDashboardComponent
            ),
    },
    {
        path: 'daily-editorial',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Admin', 'User'] }, 
        loadComponent: () => 
            import('../pages/daily-editorial/daily-editorial.component').then(
                (Component) => Component.DailyEditorialComponent
            )
    },
    {
        path: 'create-blog',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Admin'] },
        loadComponent: () => 
            import(
                '../pages/create-blog/create-blog.component'
            ).then((component) => component.CreateBlogComponent)
    },
    {
        path: 'edit-blog/:id',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Admin'] },
        loadComponent: () => 
            import(
                '../pages/create-blog/create-blog.component'
            ).then((component) => component.CreateBlogComponent)
    },    
    {
        path: 'blogs',
        loadComponent: () => 
            import(
                '../pages/blogs-list/blogs-list.component'
            ).then((component) => component.BlogsListComponent)
    },
    {
        path: 'blog-details/:id',
        loadComponent: () => 
            import(
                '../pages/blog-details/blog-details.component'
            ).then((component) => component.BlogDetailsComponent)
    },
    {
        path: 'promocode',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Admin'] },
        loadComponent: () => 
            import(
                '../pages/promocode/promocode.component'
            ).then((component) => component.PromocodeComponent)
    },
    {
        path: 'payment',
        loadChildren: () => 
            import(
                '../../features/payment/index'
            ).then((component) => component.paymentRoutes)
      },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
    }
]