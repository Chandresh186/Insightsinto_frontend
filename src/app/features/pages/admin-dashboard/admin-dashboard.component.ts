import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  public testSereisShowColumns: any ;
  public testShowColumns: any ;
  public loading : boolean = false;
  private errorMessage: string | null = null;
  public dashboardData : any;
  testSeriesTableHeaders:any = [];

  testTableHeaders: any = [];
  

  testSeriesData:any = [];


  testData: any = [];
  



  testSeriesActionsConfig = [
    { key: 'testSereisDelete', label: 'Delete', class: 'btn btn-outline-danger', visible: true },
    { key: 'testSeriesDetail', label: 'Details', class: 'btn btn-outline-info', visible: true }, // Hidden action
  ];

  testActionsConfig = [
    { key: 'testDelete', label: 'Delete', class: 'btn btn-outline-danger', visible: true },
    { key: 'testDetail', label: 'Details', class: 'btn btn-outline-info', visible: true }, // Hidden action
  ];



  handleAction(event: { action: string; row: any }) {
    switch (event.action) {
     
      case 'testSereisDelete':
        this.onTestSeriesDelete(event.row);
        break;
      case 'testSeriesDetail':
        this.ontestSeriesDetails(event.row);
        break;

      case 'testDelete':
        this.onTestDelete(event.row);
        break;

      case 'testDetail':
        this.onTestDetails(event.row);
        break;
    
      default:
        console.error('Unknown action:', event.action);
    }
  }

  constructor(private adminDashboardService : AdminDashboardService, private testSeriesService: TestSeriesService,private router: Router) {}

  ngOnInit() {
    this. getAdminDashboardDetails();
  }


  getAdminDashboardDetails() {
    this.loading = true; // Set loading state to true while fetching data
    
    this.adminDashboardService.getAdminDashboard().pipe(
      tap((response: any) => {
        // this.allEditoril = response
        this.dashboardData = response;

        this.testSeriesData = response && response.testSeries
        this.testSereisShowColumns  = this.generateTableHeaders(this.testSeriesData.map(({ id, ...rest }: any) => rest));
        this.testSeriesTableHeaders = this.generateTableHeaders(this.testSeriesData)

        this.testData = response && response.tests
        this.testShowColumns  = this.generateTableHeaders(this.testData.map(({ id,files,topics,categories,minimumPassingScore,testSeriesId,testSeriesName, ...rest }: any) => rest));
        this.testTableHeaders = this.generateTableHeaders(this.testData)

      }),
      catchError((error) => {
        this.errorMessage = 'Error loading admin dashboard.'; // Handle error message
        console.error('Error loading admin dashboard:', error);
        // this.allEditoril = []; 
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
      })
    ).subscribe();
  }



  generateTableHeaders(dataArray: any[]): { key: string; displayName: string, pipe: string | null, pipeFormat: string | null }[] {
    if (!dataArray || dataArray.length === 0) {
      return [];
    }
  
    const formatDisplayName = (key: string): string =>
      key
        .replace(/([A-Z])/g, ' $1') // Add a space before uppercase letters (camelCase to spaced)
        .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  
    return Object.keys(dataArray[0]).map((key) => {
      let pipe = null;
      let pipeFormat = null;
  
      // Add 'currency' pipe for 'fee' column
      if (key === 'fee') {
        pipe = 'currency';  // The pipe name for fee is currency
        pipeFormat = 'INR';  // No special formatting for 'currency' pipe
      } 
      // Add 'date' pipe for 'startDate' column
      else if (key === 'startDate') {
        pipe = 'date';  // The pipe name for startDate is date
        pipeFormat = 'd MMM, y';  // Custom format for date (can be changed as needed)
      }
  
      return {
        key: key,
        displayName: formatDisplayName(key),
        pipe: pipe,
        pipeFormat: pipeFormat
      };
    });
  }


  ontestSeriesDetails(val: any) {
    this.router.navigateByUrl(`dash/test-series`);
  }

  onTestSeriesDelete(val:any) {

    this.loading = true; // Set loading state to true while fetching data
  
    this.testSeriesService.deleteTestSeries(val.id).pipe(
      tap((response: any) => {
      }),
      catchError((error) => {
        this.errorMessage = 'Error creating test series.'; // Handle error message
        console.error('Error creating test series:', error);
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
        this.getAdminDashboardDetails();
      })
    ).subscribe();
  }

  onTestDelete(val: any) {
    this.loading = true;
    this.testSeriesService
    .deleteTest(val.testSeriesId , val.id)
    .pipe(
      tap((response) => {
      }),
      catchError((error) => {
        console.error('Error deleting test:', error);
        return of(error); // Return an observable to handle the error
      }),
      finalize(() => {
        this.loading = false;
        this.getAdminDashboardDetails();
      })
    )
    .subscribe();
  }

  onTestDetails(val: any) {
    this.router.navigateByUrl(`dash/test-series/test-series-details/${val.testSeriesId}`);
  }
}
