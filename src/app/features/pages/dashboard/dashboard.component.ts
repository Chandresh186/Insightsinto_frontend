import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentOrder } from '../../../core/models/interface/payment.interface';
import { PaymentService } from '../../../core/services/payment.service';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import { UserDashboardService } from '../../../core/services/user-dashboard.service';
import { CourseService } from '../../../core/services/course.service';
import { CourseListComponent } from '../course-list/course-list.component';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TableComponent, FormsModule, ReactiveFormsModule, RouterModule, CourseListComponent, CarouselModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
 
})
export class DashboardComponent {
  public showColumns: any;
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  staticBaseUrl : any = environment.staticBaseUrl

  public tableHeaders:any = [];

  public tableData:any = [];
  private orderId: string = '';


  public dashboardData : any;
  

  resultShowColumns: any;

  resultTableHeaders: any = []

  resultTableData: any = []





  @ViewChild('testSeries', { static: false }) testSeriesSection!: ElementRef;
  @ViewChild('yourtestSeries', { static: false }) yourtestSeries!: ElementRef;


  resultActionConfig = [
    { key: 'analysis', label: 'View Analysis', class: 'btn btn-outline-info', visible: false },
  ];

    // Dynamic Actions Config
    actionsConfig = [
      { key: 'buy', label: 'Buy', class: 'btn-primary', visible: true },
    ];

    testSeriesData:any = [];

      customOptions: OwlOptions = {
        loop: true,
        mouseDrag: false,
        touchDrag: false,
        pullDrag: false,
        dots: true,
        navSpeed: 700,
        navText: ['', ''],
        responsive: {
          // 0: {
          //   items: 1
          // },
          // 400: {
          //   items: 2
          // },
          // 740: {
          //   items: 3
          // },
          // 940: {
          //   items: 4
          // }
          0: {
            items: 1, // Extra small screens (phones)
          },
          576: {
            items: 2, // Small screens (phones, landscape orientation)
          },
          768: {
            items: 3, // Medium screens (tablets)
          },
          992: {
            items: 4, // Large screens (desktops)
          },
          1200: {
            items: 5, // Extra large screens (wide desktops)
          },
          1400: {
            items: 6, // Ultra-wide screens
          },
        },
        nav: false,
        autoplay: true,
      }


    constructor(private userDashboardService : UserDashboardService,private testSeriesService: TestSeriesService,private paymentService: PaymentService, private router : Router, private courseService : CourseService) {}


    handleAction(event: { action: string; row: any }) {
      switch (event.action) {
        case 'buy':
          this.onBuy(event.row);
          break;
      
        default:
          console.error('Unknown action:', event.action);
      }
    }

    resultHandleAction(event: { action: string; row: any }) {
      switch (event.action) {
       
        case 'analysis':
          this.onAnalysis(event.row);
          break;
        
      
        default:
          console.error('Unknown action:', event.action);
      }
    }

    onAnalysis(val:any) {

      console.log(val)
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
        else if (key === 'createdAt') {
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


  ngOnInit() {
    const userId = JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId
    // this.loadTestSeries();
    
    // this.loadUserTestSeries(userId);
    this.getUserDashboardDetails(userId);

    this.loadUserAllCourses(userId);
   
  }



  scrollToTestSeries() {
    this.testSeriesSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToYourTestSeries() {
    this.yourtestSeries.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  getUserDashboardDetails(userId: string) {
    this.loading = true; // Set loading state to true while fetching data
    
    this.userDashboardService.getUserDashboard(userId).pipe(
      tap((response: any) => {
        // this.allEditoril = response
        this.dashboardData = response;

        this.resultTableData = this.dashboardData && this.dashboardData.completedTestsDetails
        this.resultShowColumns  = this.generateTableHeaders(this.dashboardData && this.dashboardData.completedTestsDetails);
        this.resultTableHeaders = this.generateTableHeaders(this.dashboardData && this.dashboardData.completedTestsDetails)

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

    onBuy(row: any) {

      const userId = JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId;

      const product = {
        userid: userId,
        productid: row.id,
        moduleType: 'course'
      }
      console.log(product)
      localStorage.setItem('product', JSON.stringify(product));
      this.paymentService.setSelectedProductForCheckout(row);
      this.router.navigateByUrl(`/dash/payment/checkout/${userId}`); // Navigate to checkout
      
      // const paymentOrderData: PaymentOrder = {
      //   amount: row.fee, // Use the validated amount
      //   currency: 'INR',
      //   receipt: userId, // Use response ID as receipt
      //   productId: row.id
      // };

      // this.loading = true; // Set loading state to true while fetching data
    
      // this.paymentService.createOrder(paymentOrderData).pipe(
      //   tap((response: any) => {
      //     this.orderId = response.data.orderId; // Assuming orderResponse contains an 'id' field
      //     const product = {
      //       userid: response.data.userId,
      //       productid: response.data.productId,
      //       moduleType: 'testseries'
      //     }
      //     localStorage.setItem('product', JSON.stringify(product));
      //     this.paymentService.setSelectedProductForCheckout(row);
      //     this.router.navigateByUrl(`/payment/checkout/${this.orderId}`); // Navigate to checkout

       
      //   }),
      //   catchError((error) => {
      //     this.errorMessage = 'Error creating purchase order.'; // Handle error message
      //     console.error('Error creating purchase order:', error);
      //     return of([]); // Return an empty array in case of an error
      //   }),
      //   finalize(() => {
      //     this.loading = false; // Reset loading state when the request is completed
      //   })
      // ).subscribe();

     
     
    }


    private loadUserAllCourses(userId: any): void {
      this.loading = true; // Set loading state to true while fetching data
    
      this.courseService.getAllUserCourses(userId).pipe(
        tap((response: any) => {
         
          const courseIds = response.map((item: any) => item.id);
          
          this.courseService.setCourses(courseIds);
          // this.allCourses = response
          
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
          console.error('Error loading Daily editorials:', error);
          // this.allCourses = []; 
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
          this.loadAllCourses();
        })
      ).subscribe();
    }


    private loadAllCourses(): void {
     
      this.loading = true; // Set loading state to true while fetching data
    
      this.courseService.getAllActiveCoursesForPublic(true).pipe(
        tap((response: any) => {
          
          
          const courses = this.courseService.getCourses();
          if(courses) {
            let filteredData = response.filter((item : any) => !courses.includes(item.id));
  
            this.tableData = filteredData; // Assign the fetched data to the list
            this.showColumns  = this.generateTableHeaders(filteredData.map(({ id,courseMaterials,isActive,parentDetails,parentId,testDetails,testId,updatedAt,video, isOfflineTest, ...rest }: any) => rest));
            this.tableHeaders = this.generateTableHeaders(filteredData)

          }
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading test series.'; // Handle error message
          console.error('Error loading test series:', error);
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
        })
      ).subscribe();
    }



    // private loadUserTestSeries(userId: any): void {
    //   this.loading = true; // Set loading state to true while fetching data
    
    //   this.testSeriesService.getTestSeriesByUserId(userId).pipe(
    //     tap((response: any) => {
    //       console.log(response)
    //       this.testSeriesData = response 
          
    //     }),
    //     catchError((error) => {
    //       this.errorMessage = 'Error loading test series.'; // Handle error message
    //       console.error('Error loading test series:', error);
    //       this.testSeriesData= []
    //       return of([]); // Return an empty array in case of an error
    //     }),
    //     finalize(() => {
    //       this.loading = false; // Reset loading state when the request is completed
    //     })
    //   ).subscribe();
    // }



    seeDetails(val:any) {
      this.router.navigateByUrl(`dash/series-details/${val.id}`);
      // this.router.navigateByUrl(`dash/test-series/test-series-details/${val.id}`);
    }
}
