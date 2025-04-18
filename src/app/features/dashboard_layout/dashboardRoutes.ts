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
        data: { requiredRoles: ['User'], requiredPermissions: ['Dashboard']  }, 
        loadComponent: () =>
            import('../pages/dashboard/dashboard.component').then(
                (component) => component.DashboardComponent
            ),
        
    },

    {
        path: 'categories',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
        
        loadComponent: () =>
            import('../pages/categories/categories.component').then(
                (component) => component.CategoriesComponent
            ),
    },
    {
        path: 'test-series',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin']}, 
        loadChildren: () =>
            import('../test/index').then(
                (component) => component.testRoutes
            ),
    },
    {
        path: 'test-list',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
        loadComponent: () => 
            import('../test/components/test-list/test-list.component').then(
                (Component) => Component.TestListComponent
            )
    },
    {
        path: 'settings',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin', 'User'] },
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
        path: 'test/:id/:courseId',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['User'] }, 
        loadComponent: () =>
            import('../pages/attempt-test/attempt-test.component').then(
                (component) => component.AttemptTestComponent
            ),
    },
    {
        path: 'test-offline/:id/:testSeriesId',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['User'] }, 
        loadComponent: () =>
            import('../pages/attempt-test-offline/attempt-test-offline.component').then(
                (component) => component.AttemptTestOfflineComponent
            ),
    },
    {
        path: 'result-analysis/:id',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['User'] }, 
        loadComponent: () =>
            import('../pages/view-analysis/view-analysis.component').then(
                (component) => component.ViewAnalysisComponent
            ),
    },
    {
        path: 'dashboard',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] }, 
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
        data: { requiredRoles: ['Super Admin','Admin', 'User'] }, 
        loadComponent: () => 
            import('../pages/daily-editorial/daily-editorial.component').then(
                (Component) => Component.DailyEditorialComponent
            )
    },
    {
        path: 'create-blog',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
        loadComponent: () => 
            import(
                '../pages/create-blog/create-blog.component'
            ).then((component) => component.CreateBlogComponent)
    },
    {
        path: 'edit-blog/:id',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
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
        data: { requiredRoles: ['Super Admin','Admin'] },
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
        path: 'question-list',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
        loadComponent:() =>
            import (
                '../../features/pages/question-list/question-list.component'
            ).then((component) => component.QuestionListComponent)
    },
    {
        path: 'create-question',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
        loadComponent:() =>
            import (
                '../../features/pages/create-question/create-question.component'
            ).then((component) => component.CreateQuestionComponent)
    },
    {
        path: 'edit-question/:id',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
        loadComponent:() =>
            import (
                '../../features/pages/create-question/create-question.component'
            ).then((component) => component.CreateQuestionComponent)
    },
    {
        path: 'course-list',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
        loadComponent:() =>
            import (
                '../../features/pages/course-list/course-list.component'
            ).then((component) => component.CourseListComponent)
    },
    {
        path: 'create-course',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
        loadComponent:() =>
            import (
                '../../features/pages/create-course/create-course.component'
            ).then((component) => component.CreateCourseComponent)
    },
    {
        path: 'edit-course/:id',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin'] },
        loadComponent:() =>
            import (
                '../../features/pages/create-course/create-course.component'
            ).then((component) => component.CreateCourseComponent)
    },
    {
        path: 'course-detail/:id',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin','Admin', 'User'] },
        loadComponent:() => 
            import (
                '../../features/pages/course-detail-page/course-detail-page.component'
            ).then((component) => component.CourseDetailPageComponent)
    },
    {
        path: 'user-testSeries',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['User'] },
        loadComponent:() => 
            import (
                '../../features/pages/user-test-series/user-test-series.component'
            ).then((component) => component.UserTestSeriesComponent)
    },
    {
        path: 'user-list',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin'] },
        loadComponent:() => 
            import (
                '../../features/pages/user-list/user-list.component'
            ).then((component) => component.UserListComponent)
    }, 
    {
        path: 'user-permissions/:id',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin'] },
        loadComponent:() => 
            import (
                '../../features/pages/user-permissions/user-permissions.component'
            ).then((component) => component.UserPermissionsComponent)
    },
    {
        path: 'Youtube-links',
        canActivate: [permissionGuard], 
        data: { requiredRoles: ['Super Admin', 'Admin'] },
        loadComponent:() => 
            import (
                '../../features/pages/youtube-link-management/youtube-link-management.component'
            ).then((component) => component.YoutubeLinkManagementComponent)
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full',
    }
]