import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  public showColumns1: any ;
  public showColumns2: any ;
  tableHeaders:any = [
    // { key: 'id', displayName: 'ID' },
    // { key: 'name', displayName: 'Name' },
    // { key: 'medium', displayName: 'Medium' },
    // { key: 'details', displayName: 'Details' },
    // { key: 'startDate', displayName: 'Start Date' },
    // { key: 'fee', displayName: 'Fee' }
  ];

  tableHeader: any = [
    // { key: 'id', displayName: 'ID' },
    // { key: 'name', displayName: 'Test Series Name' },
    // { key: 'medium', displayName: 'Delivery Mode' },
    // { key: 'details', displayName: 'Description' },
    // { key: 'startDate', displayName: 'Starting Date' },
    // { key: 'fee', displayName: 'Cost (INR)' }
  ];
  

  tableData:any = [
    {
      id: '1',
      name: 'Test Series 1',
      medium: 'Online',
      details: 'Details 1',
      startDate: '2024-11-12',
      fee: '1000'
    },
    {
      id: '2',
      name: 'Test Series 2',
      medium: 'Offline',
      details: 'Details',
      startDate: '2024-11-15',
      fee: '1500'
    }
  ];


  tableDatas: any = [
    {
      id: '1',
      name: 'Advanced Java Programming',
      medium: 'Online',
      details: 'In-depth coverage of advanced Java concepts.',
      startDate: '2024-12-01',
      fee: '1200'
    },
    {
      id: '2',
      name: 'Data Science Bootcamp',
      medium: 'Hybrid',
      details: 'Comprehensive course on Data Science, covering theory and practice.',
      startDate: '2024-12-10',
      fee: '2000'
    },


    {
      id: '2',
      name: 'Data Science Bootcamp',
      medium: 'Hybrid',
      details: 'Comprehensive course on Data Science, covering theory and practice.',
      startDate: '2024-12-10',
      fee: '2000'
    },


    {
      id: '2',
      name: 'Data Science Bootcamp',
      medium: 'Hybrid',
      details: 'Comprehensive course on Data Science, covering theory and practice.',
      startDate: '2024-12-10',
      fee: '2000'
    },
    
  ];
  



  actionsConfig = [
    { key: 'delete', label: 'Delete', class: 'btn btn-outline-danger', visible: true },
    { key: 'detail', label: 'Details', class: 'btn btn-outline-info', visible: true }, // Hidden action
  ];




  handleAction(event: { action: string; row: any }) {
    // console.log(`Action: ${event.action}, Row:`, event.row);
    switch (event.action) {
     
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



  ngOnInit() {
    this.showColumns1  = this.generateTableHeaders(this.tableData.map(({ id, ...rest }: any) => rest));
    this.tableHeaders = this.generateTableHeaders(this.tableData)

    this.showColumns2  = this.generateTableHeaders(this.tableDatas.map(({ id, ...rest }: any) => rest));
    this.tableHeader = this.generateTableHeaders(this.tableDatas)

    console.log(this.tableHeader, this.tableHeaders)
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


  onDetails(val: any) {
    console.log(val);
  }

  onDelete(val:any) {
    console.log(val)
  }

  onEdit(val: any) {
    console.log(val)
  }
}
