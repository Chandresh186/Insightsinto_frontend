import { Routes } from "@angular/router";

export const testRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
          import('./components/test-layout/test-layout.component').then(
              (Component) => Component.TestLayoutComponent
          ),
            
          children: [ 
              {
                  path: '',
                  loadComponent: () =>
                      import('./components/test-series/test-series.component').then(
                          (Component) => Component.TestSeriesComponent
                      ),
              },

              {
                path: 'test-series-details/:id',
                loadComponent: () =>
                    import('./components/test-series-details/test-series-details.component').then(
                        (Component) => Component.TestSeriesDetailsComponent
                    ),
            },
          
          ],
      },
]