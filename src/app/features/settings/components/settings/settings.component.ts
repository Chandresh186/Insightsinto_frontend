import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { INSIGHT_INTO_ROLE } from '../../../../core/enums/roles';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncButtonComponent } from '../../../../shared/resusable_components/async-button/async-button.component';
import { validationErrorMessage } from '../../../../core/constants/validation.constant';
import { SettingsService } from '../../../../core/services/settings.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncButtonComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  public userRole!: INSIGHT_INTO_ROLE | any;
  public userId!: string;
  public isLightMode: boolean = false;
  public loading : boolean = false
  private errorMessage: string | null = null; // To store error messages

  public eventPriorityForm!: FormGroup;
  public taskPriorityForm!: FormGroup;
  public accountSettingsForm!: FormGroup;
  public manageDashboardForm!: FormGroup;

  public validationErrorMessage = validationErrorMessage;



  public isEventAsyncCall = false;
  public isTaskAsyncCall = false;
  public isProfileAsyncCall = false;
  public meetingTypeList: any[] = [];


  public settings =
  [
    // {
    //   heading: 'Calendar',
    //   permission: [INSIGHT_INTO_ROLE.Admin],
    //   icon: 'bi bi-calendar2',
    //   tabs: [
    //     { id: 'v-pills-general',
    //        permission: [INSIGHT_INTO_ROLE.Admin],
    //         target: "General", label: 'General', active: true },
    //     { id: 'v-pills-smart-color',
    //        permission: [INSIGHT_INTO_ROLE.Admin],
    //         target: "smart-color", label: 'Smart color coding', active: false },
    //     { id: 'v-pills-meeting-type', 
    //       permission: [INSIGHT_INTO_ROLE.Admin],
    //        target: "meeting-type", label: 'Meeting Type', active: false },
    //   ],
    // },
    {
      heading: 'Account',
      permission: [INSIGHT_INTO_ROLE.Admin, INSIGHT_INTO_ROLE.User],
      icon: 'bi bi-person',
      tabs: [
        { id: 'v-pills-profile', permission: [INSIGHT_INTO_ROLE.Admin, INSIGHT_INTO_ROLE.User],target: "Profile", label: 'Profile', active: true },
        // { id: 'v-pills-onboarding', 
        //   permission: [INSIGHT_INTO_ROLE.Admin],
        //    target: "Onboarding_Form", label: 'Onboarding form', active: false },
        // { id: 'v-pills-label', permission: [RESTORE_ROLE.employee, RESTORE_ROLE.managerhr, RESTORE_ROLE.admin, RESTORE_ROLE.superAdmin], target: "Emails", label: 'Emails', active: false },
      ],
    },
    // {
    //   heading: 'Integrations',
    //   permission: [INSIGHT_INTO_ROLE.Admin],
    //   icon: 'bi bi-grid',
    //   tabs: [
    //     { id: 'v-pills-calendar',
    //        permission: [INSIGHT_INTO_ROLE.Admin],
    //         target: "calendar", label: 'Calendar', active: false },
    //   ],
    // },
    // {
    //   heading: 'Dashboard',
    //   permission: [INSIGHT_INTO_ROLE.Admin],
    //   icon: 'bi bi-grid-1x2',
    //   tabs: [
    //     { id: 'v-pills-manage-dashboard',
    //        permission: [INSIGHT_INTO_ROLE.Admin],
    //         target: "Manage-dashboard", label: 'Manage dashboard', active: false },
    //   ],
    // },
  ];


  constructor(private fb: FormBuilder, private settingsService: SettingsService, private toastr: ToastrService) {}

  ngOnInit() {
    this.userId = JSON.parse(localStorage.getItem('currentUser')!).response?.userId;
    this.userRole = JSON.parse(localStorage.getItem('currentUser')!).response?.role;
    this.isLightMode = !!localStorage.getItem('themeColor');

    this.getProfile(this.userId)

    this.initForms();
  }

  selectTab(selectedTab: { id: any; }, selectedSetting: { tabs: any[]; }) {
    selectedSetting.tabs.forEach(tab => (tab.active = tab.id === selectedTab.id));
  }

  themeToggle() {
    this.isLightMode = !this.isLightMode;
    if (this.isLightMode) {
      localStorage.setItem('themeColor', "restoreDarkMode");
      window.location.reload();
    }
    else {
      localStorage.removeItem('themeColor');
      window.location.reload();
    }
  }

  initForms() {
    this.eventPriorityForm = this.fb.group({
      high: ['#87DEE4',],
      medium: ['#87DEE4',],
      low: ['#87DEE4',],
    });

    this.taskPriorityForm = this.fb.group({
      high: ['#87DEE4',],
      medium: ['#87DEE4',],
      low: ['#87DEE4',],
    });

    this.accountSettingsForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      mobNumber: ['', [Validators.required]],
      role: ['User', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.manageDashboardForm = this.fb.group({
      activeEmployee: [false],
      totalEmployee: [false],
      appInteractionTracking: [false],
      employeeEventTaskLineChart: [false],
      employeeLinechart: [false],
      employeePichart: [false],
      meetingAnalytics: [false],
      timeUtilization: [false],
      totalMeetingsHour: [false],
      totalTasksHour: [false],
      totalUpcommingMeeting: [false],
      totalUpcommingTasks: [false],
      todo: [false],
      dailyStatus: [false],
      restoreRatio: [false],
      equilibrium: [false],
      restoreScore: [false],
      burnout: [false],

      totalMeeting: [false],
      totalTask: [false],
      activeManager: [false],
      totalManager: [false],
      userId: JSON.parse(localStorage.getItem('currentUser')!).response.userId
    });
  }

    // Restrict the input to numbers and max 10 digits
    onInputChange(event: any) {
      // Remove any non-numeric characters
      let inputValue = event.target.value.replace(/[^0-9]/g, '');
  
      // Update the input value with the sanitized number
      if (inputValue.length > 10) {
        inputValue = inputValue.slice(0, 10); // Keep only the first 10 digits
      }

      event.target.value = inputValue;
  
      // Update the form control value with the sanitized value
      this.accountSettingsForm.get('mobNumber')?.setValue(inputValue)
      // this.mobNumber?.setValue(inputValue);
    }

  get accountSettingControls() {
    return this.accountSettingsForm.controls;
  }

  getProfile(id: string) {
    this.loading = true;  // Set loading state to true while fetching data
    this.settingsService.getUserById(id).pipe(
      tap(response => {
        // Assign the fetched categories to the categories array
        this.accountSettingsForm.patchValue({
          firstName: response?.firstName,
          lastName: response?.lastName,
          email: response?.email,
          mobNumber: response?.mobNumber,

        });
     
      }),
      catchError(error => {
        this.errorMessage = 'Failed to load categories.';
        console.error('Error fetching categories:', error);
        this.toastr.warning('We couldnt find your profile.', "Error!");
        return of([]);  // Return an empty array if there's an error
      }),
      finalize(() => {
        this.loading = false;  // Reset loading state when the request is completed
        
        
      })
    ).subscribe();
  }



  eventPriorityColor() {
    
  }

  taskPriorityColor() {

  }

  addMeetingType(val:any, n: any) {

  }

  accountSettings() {
    this.isProfileAsyncCall = true;
    this.loading = true;  // Set loading state to true while fetching data

    const formData = this.accountSettingsForm.value;

    const combinedData = {
      id: this.userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobNumber: formData.mobNumber,

    };
    
    this.settingsService.updateUser(this.userId, combinedData).pipe(
      tap(response => {
        // Assign the fetched categories to the categories array
      }),
      catchError(error => {
        this.errorMessage = 'Failed to load categories.';
        console.error('Error fetching categories:', error);
        this.toastr.warning('We couldnt find your profile.', "Error!");
        return of([]);  // Return an empty array if there's an error
      }),
      finalize(() => {
        this.loading = false;  // Reset loading state when the request is completed
        this.isProfileAsyncCall = false;
        this.getProfile(this.userId)
        this.toastr.success('Your profile has been updated successfully.', "Success!");
      })
    ).subscribe();
   
  }
}
