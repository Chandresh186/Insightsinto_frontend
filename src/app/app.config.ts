import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { InMemoryScrollingFeature, InMemoryScrollingOptions, provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpConfigInterceptor } from './core/interceptors/http-config.interceptor';
import {
  provideShareButtonsOptions,
  SharerMethods,
  withConfig,
} from 'ngx-sharebuttons';
import { shareIcons } from 'ngx-sharebuttons/icons';
import { ClipboardModule } from '@angular/cdk/clipboard';
import {PlatformModule} from '@angular/cdk/platform';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};

const inMemoryScrollingFeature: InMemoryScrollingFeature =
  withInMemoryScrolling(scrollConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, inMemoryScrollingFeature),
    provideHttpClient(withInterceptors([httpConfigInterceptor])),
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      NgxSpinnerModule,
      ToastrModule.forRoot({
        timeOut:  5000,
        positionClass: 'toast-top-right',
        preventDuplicates: true
      }),
      NgxSpinnerModule.forRoot({type: 'ball-scale-multiple'}),
      ClipboardModule,
      PlatformModule
    ),
    provideShareButtonsOptions(
      shareIcons(),
      withConfig({
        debug: true,
        sharerMethod: SharerMethods.Anchor,
      })
    ),
  ]
};
