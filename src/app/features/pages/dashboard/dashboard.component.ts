import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentOrder } from '../../../core/models/interface/payment.interface';
import { PaymentService } from '../../../core/services/payment.service';
import { Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TableComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
 
})
export class DashboardComponent {
  public showColumns: any;
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages

  public tableHeaders:any = [];

  public tableData:any = [];
  private orderId: string = '';
  @ViewChild('testSeries', { static: false }) testSeriesSection!: ElementRef;
  @ViewChild('yourtestSeries', { static: false }) yourtestSeries!: ElementRef;


    // Dynamic Actions Config
    actionsConfig = [
      { key: 'buy', label: 'Buy', class: 'btn-primary', visible: true },
      // { key: 'delete', label: 'Delete', class: 'btn-danger', visible: true },
      // { key: 'view', label: 'View', class: 'btn-secondary', visible: false }, // Hidden action
    ];

    testSeriesData:any = [
      {
        title: 'Test Series 1',
        status: 'Active',
        tests: 10,
        medium: 'English',
        startDate: '2024-11-25',
        buttonLabel: 'View Details'
      },
      // {
      //   title: 'Test Series 2',
      //   status: 'Completed',
      //   tests: 15,
      //   medium: 'English',
      //   startDate: '2024-11-25',
      //   buttonLabel: 'View Results'
      // },
      // {
      //   title: 'Test Series 3',
      //   status: 'Upcoming',
      //   tests: 8,
      //   medium: 'English',
      //   startDate: '2024-11-25',
      //   buttonLabel: 'Start Now'
      // },
      // {
      //   title: 'Test Series 4',
      //   status: 'Upcoming',
      //   tests: 8,
      //   medium: 'English',
      //   startDate: '2024-11-25',
      //   buttonLabel: 'Start Now'
      // },
      // {
      //   title: 'Test Series 5',
      //   status: 'Upcoming',
      //   tests: 8,
      //   medium: 'English',
      //   startDate: '2024-11-25',
      //   buttonLabel: 'Start Now'
      // },
      // {
      //   title: 'Test Series 6',
      //   status: 'Upcoming',
      //   tests: 8,
      //   medium: 'English',
      //   startDate: '2024-11-25',
      //   buttonLabel: 'Start Now'
      // },
      // {
      //   title: 'Test Series 7',
      //   status: 'Upcoming',
      //   tests: 8,
      //   medium: 'English',
      //   startDate: '2024-11-25',
      //   buttonLabel: 'Start Now'
      // },
      // {
      //   title: 'Test Series 8',
      //   status: 'Upcoming',
      //   tests: 8,
      //   medium: 'English',
      //   startDate: '2024-11-25',
      //   buttonLabel: 'Start Now'
      // },
      // {
      //   title: 'Test Series 9',
      //   status: 'Upcoming',
      //   tests: 8,
      //   medium: 'English',
      //   startDate: '2024-11-25',
      //   buttonLabel: 'Start Now'
      // },
      // {
      //   title: 'Test Series 10',
      //   status: 'Upcoming',
      //   tests: 8,
      //   medium: 'English',
      //   startDate: '2024-11-25',
      //   buttonLabel: 'Start Now'
      // }
    ];


    constructor(private testSeriesService: TestSeriesService,private paymentService: PaymentService, private router : Router) {}


    handleAction(event: { action: string; row: any }) {
      // console.log(`Action: ${event.action}, Row:`, event.row);
      switch (event.action) {
        case 'buy':
          this.onBuy(event.row);
          break;
      
        default:
          console.error('Unknown action:', event.action);
      }
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


  ngOnInit() {
    const userId = JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId
    this.loadTestSeries();
    this.loadUserTestSeries(userId)
   
  }



  scrollToTestSeries() {
    this.testSeriesSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToYourTestSeries() {
    this.yourtestSeries.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

    onBuy(row: any) {
      console.log(row)

      const userId = JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId;
      
      const paymentOrderData: PaymentOrder = {
        amount: row.fee, // Use the validated amount
        currency: 'INR',
        receipt: userId, // Use response ID as receipt
        productId: row.id
      };
      console.log(paymentOrderData)

      this.loading = true; // Set loading state to true while fetching data
    
      this.paymentService.createOrder(paymentOrderData).pipe(
        tap((response: any) => {
          console.log('Purchase order created successfully:', response);
          this.orderId = response.data.orderId; // Assuming orderResponse contains an 'id' field
          const product = {
            userid: response.data.userId,
            productid: response.data.productId
          }
          localStorage.setItem('product', JSON.stringify(product));
          this.paymentService.setSelectedProductForCheckout(row);
          this.router.navigateByUrl(`/payment/checkout/${this.orderId}`); // Navigate to checkout

       
        }),
        catchError((error) => {
          this.errorMessage = 'Error creating purchase order.'; // Handle error message
          console.error('Error creating purchase order:', error);
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
        })
      ).subscribe();

     
     
    }


    private loadTestSeries(): void {
      this.loading = true; // Set loading state to true while fetching data
    
      this.testSeriesService.getTestSeries().pipe(
        tap((response: any) => {
          // console.log('Test Series fetched successfully:', response);
          this.tableData = response.response; // Assign the fetched data to the list
          this.showColumns  = this.generateTableHeaders(response.response.map(({ id, ...rest }: any) => rest));
          this.tableHeaders = this.generateTableHeaders(response.response)
          // console.log(this.tableHeaders, this.tableData)
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



    private loadUserTestSeries(userId: any): void {
      this.loading = true; // Set loading state to true while fetching data
    
      this.testSeriesService.getTestSeriesByUserId(userId).pipe(
        tap((response: any) => {
          console.log('Test Series fetched successfully:', response);
          this.testSeriesData = response 
          
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading test series.'; // Handle error message
          console.error('Error loading test series:', error);
          this.testSeriesData= []
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
        })
      ).subscribe();
    }



    seeDetails(val:any) {
      console.log(val);
      this.router.navigateByUrl(`dash/series-details/${val.id}`);
      // this.router.navigateByUrl(`dash/test-series/test-series-details/${val.id}`);
    }
}
