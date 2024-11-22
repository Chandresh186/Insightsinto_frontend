import { Routes } from "@angular/router";

export const paymentRoutes: Routes = [
    {
      path: '',
      loadComponent: () =>
        import('./components/payment-layout/payment-layout.component').then(
            (Component) => Component.PaymentLayoutComponent
        ),
          
        children: [ 
            {
                path: 'checkout/:id',
                loadComponent: () =>
                    import('./components/checkout/checkout.component').then(
                        (Component) => Component.CheckoutComponent
                    ),
            },
            { 
                path: 'success',
                loadComponent: () =>
                    import('./components/payment-success/payment-success.component').then(
                        (Component) => Component.PaymentSuccessComponent
                    ),
            },
            { 
                path: 'failure',
                loadComponent: () =>
                    import('./components/payment-failure/payment-failure.component').then(
                        (Component) => Component.PaymentFailureComponent
                    ),
            },
        ],
    },
  ];