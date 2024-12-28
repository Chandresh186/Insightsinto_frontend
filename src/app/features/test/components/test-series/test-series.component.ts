import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TableComponent } from '../../../../shared/resusable_components/table/table.component';
import { catchError, finalize, of, tap } from 'rxjs';
import { TestSeriesService } from '../../../../core/services/test-series.service';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { testSeriesValidationErrorMessage } from '../../../../core/constants/validation.constant';

@Component({
  selector: 'app-test-series',
  standalone: true,
  imports: [CommonModule, TableComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './test-series.component.html',
  styleUrls: ['./test-series.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TestSeriesComponent implements OnInit {
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public showColumns: any ;
  public testSeriesForm!: FormGroup;
  public validationErrorMessage = testSeriesValidationErrorMessage;
  isCreateTestSeriesAsyncCall: boolean = false;
  private modalRef!: NgbModalRef;
  public idToBeUpdated : any;
	closeResult = '';

  @ViewChild('content') content!: TemplateRef<any>;
  testSeries = [
    {
      title: 'Test Series 1',
      status: 'Active',
      tests: 10,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'View Details'
    },
    {
      title: 'Test Series 2',
      status: 'Completed',
      tests: 15,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'View Results'
    },
    {
      title: 'Test Series 3',
      status: 'Upcoming',
      tests: 8,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'Start Now'
    },
    {
      title: 'Test Series 4',
      status: 'Upcoming',
      tests: 8,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'Start Now'
    },
    {
      title: 'Test Series 5',
      status: 'Upcoming',
      tests: 8,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'Start Now'
    },
    {
      title: 'Test Series 6',
      status: 'Upcoming',
      tests: 8,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'Start Now'
    },
    {
      title: 'Test Series 7',
      status: 'Upcoming',
      tests: 8,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'Start Now'
    },
    {
      title: 'Test Series 8',
      status: 'Upcoming',
      tests: 8,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'Start Now'
    },
    {
      title: 'Test Series 9',
      status: 'Upcoming',
      tests: 8,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'Start Now'
    },
    {
      title: 'Test Series 10',
      status: 'Upcoming',
      tests: 8,
      medium: 'English',
      startDate: '2024-11-25',
      buttonLabel: 'Start Now'
    }
  ];


  tableHeaders:any = [
    // { key: 'id', displayName: 'ID' },
    // { key: 'name', displayName: 'Name' },
    // { key: 'medium', displayName: 'Medium' },
    // { key: 'details', displayName: 'Details' },
    // { key: 'startDate', displayName: 'Start Date' },
    // { key: 'fee', displayName: 'Fee' }
  ];


  tableData:any = [
    // {
    //   id: '1',
    //   name: 'Test Series 1',
    //   medium: 'Online',
    //   details: 'Details about Test Series 1',
    //   startDate: '2024-11-12',
    //   fee: '1000'
    // },
    // {
    //   id: '2',
    //   name: 'Test Series 2',
    //   medium: 'Offline',
    //   details: 'Details about Test Series 2',
    //   startDate: '2024-11-15',
    //   fee: '1500'
    // }
  ];


  actionsConfig = [
    { key: 'edit', label: 'Edit', class: 'btn btn-outline-primary', visible: true },
    { key: 'delete', label: 'Delete', class: 'btn btn-outline-danger', visible: true },
    { key: 'detail', label: 'Details', class: 'btn btn-outline-info', visible: true }, // Hidden action
  ];


  handleAction(event: { action: string; row: any }) {
    switch (event.action) {
      case 'edit':
        this.onEdit(event.row);
        break;
      case 'delete':
        this.onDelete(event.row);
        break;
      case 'detail':
        this.onDetails(event.row);
        break;
    
      default:
        console.error('Unknown action:', event.action);
    }
  }

  constructor(private testSeriesService: TestSeriesService, private modalService: NgbModal, private router : Router) { }

  ngOnInit() {
    this.testSeriesForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      medium: new FormControl('', [Validators.required]),
      details: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      fee: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]) // Fee should be a number
    });
    this.loadTestSeries();
  }

  get testSeriesControls() {
    return this.testSeriesForm.controls;
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
  
  

  private loadTestSeries(): void {
    this.loading = true; // Set loading state to true while fetching data
  
    this.testSeriesService.getTestSeries().pipe(
      tap((response: any) => {
        this.tableData = response.response; // Assign the fetched data to the list
        this.showColumns  = this.generateTableHeaders(response.response.map(({ id, ...rest }: any) => rest));
        this.tableHeaders = this.generateTableHeaders(response.response)
        
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


  CreateTestseries() {
    
    const reqBody = {
      name: this.testSeriesForm.get('name')?.value,
      medium: this.testSeriesForm.get('medium')?.value,
      details: this.testSeriesForm.get('details')?.value,
      startDate: new Date(this.testSeriesForm.get('startDate')?.value),
      fee: this.testSeriesForm.get('fee')?.value
    }


    this.isCreateTestSeriesAsyncCall = true;
    this.loading = true; // Set loading state to true while fetching data
  
    this.testSeriesService.createTestSeries(reqBody).pipe(
      tap((response: any) => {
      }),
      catchError((error) => {
        this.errorMessage = 'Error creating test series.'; // Handle error message
        console.error('Error creating test series:', error);
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
        this.isCreateTestSeriesAsyncCall = true;
        this.testSeriesForm.reset();
        this.loadTestSeries();
        this.closeModal();
      })
    ).subscribe();
  }


  EditTestseries() {
    
    const reqBody = {
      name: this.testSeriesForm.get('name')?.value,
      medium: this.testSeriesForm.get('medium')?.value,
      details: this.testSeriesForm.get('details')?.value,
      startDate: new Date(this.testSeriesForm.get('startDate')?.value),
      fee: this.testSeriesForm.get('fee')?.value
    }


    this.isCreateTestSeriesAsyncCall = true;
    this.loading = true; // Set loading state to true while fetching data
  
    this.testSeriesService.updateTestSeries(this.idToBeUpdated, reqBody).pipe(
      tap((response: any) => {
      }),
      catchError((error) => {
        this.errorMessage = 'Error creating test series.'; // Handle error message
        console.error('Error creating test series:', error);
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
        this.isCreateTestSeriesAsyncCall = true;
        this.idToBeUpdated = undefined
        this.testSeriesForm.reset();
        this.loadTestSeries();
        this.closeModal();
      })
    ).subscribe();
  }


  openModel() {
		this.modalRef = this.modalService.open(this.content, { scrollable: true, ariaLabelledBy: 'modal-basic-title' })
	}

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close(); // Close the modal
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
  
    // Manually extract the day, month, and year
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);  // Months are 0-indexed
    const year = date.getFullYear();
  
    // Return formatted date as yyyy-MM-dd
    return `${year}-${month}-${day}`;
  }



  onEdit(e:any) {

    this.testSeriesForm.patchValue({
      name: e.name,
      details: e.details,
      fee: e.fee,
      medium: e.medium,
      startDate: this.formatDate(e.startDate) // set the new value for startDate
    });
    this.idToBeUpdated = e.id

    this.openModel()
  }

  onDelete(e:any) {  

    this.loading = true; // Set loading state to true while fetching data
  
    this.testSeriesService.deleteTestSeries(e.id).pipe(
      tap((response: any) => {
      }),
      catchError((error) => {
        this.errorMessage = 'Error creating test series.'; // Handle error message
        console.error('Error creating test series:', error);
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
        this.loadTestSeries();
      })
    ).subscribe();
  }


  onDetails(e:any) {
    this.router.navigateByUrl(`dash/test-series/test-series-details/${e.id}`);
  }

}
