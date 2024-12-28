import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { Router } from '@angular/router';
import { UserDashboardService } from '../../../core/services/user-dashboard.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {
  public testSereisShowColumns: any ;
  public testShowColumns: any ;
  public loading : boolean = false;
  private errorMessage: string | null = null;
  public dashboardData : any;
  testSeriesTableHeaders:any = [];

  testTableHeaders: any = [];

  ShowColumns: any;

  tableHeaders: any = [
    
  ]

  tableData: any = [
    // {
    //   test: "Math Test 1",
    //   testSeries: "Series A",
    //   score: 85
    // },
    // {
    //   test: "Science Test 1",
    //   testSeries: "Series B",
    //   score: 90
    // },
    // {
    //   test: "English Test 1",
    //   testSeries: "Series C",
    //   score: 78
    // },
    // {
    //   test: "History Test 1",
    //   testSeries: "Series A",
    //   score: 92
    // },
    // {
    //   test: "Geography Test 1",
    //   testSeries: "Series B",
    //   score: 88
    // }
  ]
  

  testSeriesData:any = [];


  testData: any = [];
  



  actionConfig = [
    { key: 'analysis', label: 'View Analysis', class: 'btn btn-outline-info', visible: false },
  ];





  handleAction(event: { action: string; row: any }) {
    switch (event.action) {
     
      case 'analysis':
        this.onAnalysis(event.row);
        break;
      
    
      default:
        console.error('Unknown action:', event.action);
    }
  }

  constructor(private userDashboardService : UserDashboardService, private testSeriesService: TestSeriesService,private router: Router) {}


  onAnalysis(val:any) {
  }
  ngOnInit() {
   
   
    // this.ShowColumns  = this.generateTableHeaders(this.tableData.map(({ id, ...rest }: any) => rest));
    // this.tableHeaders = this.generateTableHeaders(this.tableData)

   


    this. getUserDashboardDetails(this.getUserId());
  }

  getUserId() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId
  }


  getUserDashboardDetails(userId: string) {
    this.loading = true; // Set loading state to true while fetching data
    
    this.userDashboardService.getUserDashboard(userId).pipe(
      tap((response: any) => {
        // this.allEditoril = response
        this.dashboardData = response;

        this.tableData = this.dashboardData && this.dashboardData.completedTestsDetails
        this.ShowColumns  = this.generateTableHeaders(this.dashboardData && this.dashboardData.completedTestsDetails);
        this.tableHeaders = this.generateTableHeaders(this.dashboardData && this.dashboardData.completedTestsDetails)

        // this.testData = response && response.tests
        // this.testShowColumns  = this.generateTableHeaders(this.testData.map(({ id,files,topics,categories,minimumPassingScore,testSeriesId,testSeriesName, ...rest }: any) => rest));
        // this.testTableHeaders = this.generateTableHeaders(this.testData)



       

        
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


  startNow(testSeriesId: string) {
    this.router.navigateByUrl(`dash/series-details/${testSeriesId}`);
  }


  // ontestSeriesDetails(val: any) {
  //   this.router.navigateByUrl(`dash/test-series`);
  // }

  // onTestSeriesDelete(val:any) {

  //   this.loading = true; // Set loading state to true while fetching data
  
  //   this.testSeriesService.deleteTestSeries(val.id).pipe(
  //     tap((response: any) => {
  //     }),
  //     catchError((error) => {
  //       this.errorMessage = 'Error creating test series.'; // Handle error message
  //       console.error('Error creating test series:', error);
  //       return of([]); // Return an empty array in case of an error
  //     }),
  //     finalize(() => {
  //       this.loading = false; // Reset loading state when the request is completed
  //       this.getAdminDashboardDetails();
  //     })
  //   ).subscribe();
  // }

  // onTestDelete(val: any) {
  //   this.loading = true;
  //   this.testSeriesService
  //   .deleteTest(val.testSeriesId , val.id)
  //   .pipe(
  //     tap((response) => {
  //     }),
  //     catchError((error) => {
  //       console.error('Error deleting test:', error);
  //       return of(error); // Return an observable to handle the error
  //     }),
  //     finalize(() => {
  //       this.loading = false;
  //       this.getAdminDashboardDetails();
  //     })
  //   )
  //   .subscribe();
  // }

  // onTestDetails(val: any) {
  //   this.router.navigateByUrl(`dash/test-series/test-series-details/${val.testSeriesId}`);
  // }
}
