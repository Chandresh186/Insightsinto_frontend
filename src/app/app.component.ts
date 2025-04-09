import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from './core/services/settings.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, of, tap } from 'rxjs';

interface Setting {
  id: string;
  moduleName: string;
  show: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit {
  title = 'insightInto';
  public themeColor = null;
  private intervalId: any;
  // settingsSignal = signal<Setting[]>([]);

  // public themeColor = 'restoreDarkMode';
  constructor(
    private settingsService: SettingsService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // // this.settingsService.fetchSettings(); 
    // this.intervalId = setInterval(() => {
    //   console.log('Fetching settings...');
    //   this.settingsService.fetchSettings();
    // }, 120000); // 2 minutes interval
  }

  // detectRoutes(e: any) {
    // this.settingsService.fetchSettings();
  // }

  // getSettingList() {
  //   this.settingsService
  //     .getSettingList()
  //     .pipe(
  //       tap((response) => {
  //         console.log(response);
  //         this.settingsSignal.set(response);
  //         // this.settingList = response
  //         console.log('Fetched Data:', this.settingsSignal());
  //       }),
  //       catchError((error) => {
  //         this.toastr.warning('We couldnt find your profile.', 'Error!');
  //         return of([]); // Return an empty array if there's an error
  //       }),
  //       finalize(() => {})
  //     )
  //     .subscribe();
  // }
}
