import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TableComponent implements OnChanges {
  @Input() tableHeaders: { key: string; displayName: string, pipe: string | null, pipeFormat:string }[] = [];
  @Input() tableData: any[] = [];
  @Input() itemsPerPage: number = 5; // Default items per page
  @Input() tableName!: string;

  // Add visibility flags for table name, search bar, and columns
  @Input() showTableName: boolean = true;  // To toggle the visibility of table name
  @Input() showSearchBar: boolean = true;  // To toggle the visibility of search bar
  @Input() showColumns: string[] = [];     // To toggle visibility of specific columns based on header keys

    // Actions Configuration
  @Input() actionsConfig: {
    key: string;
    label: string;
    class?: string;
    visible?: boolean;
  }[] = [];

  @Output() actionTriggered = new EventEmitter<{ action: string; row: any }>();

  currentPage: number = 1;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';
  paginatedData: any[] = []; // Holds the data to be displayed on the current page
  filteredData: any[] = []; // Holds the filtered data based on the search term
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.filteredData = this.tableData;
    this.updatePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData']) {
      this.filteredData = this.tableData;
      this.updatePagination();
      // console.log('Table data has changed:', changes['tableData'].currentValue);
    }
    if (changes['tableHeaders']) {
      console.log('Table headers have changed:', changes['tableHeaders'].currentValue);
    }
  }

      // Search functionality: filter data based on the search term
  onSearch(): void {
 
    this.filteredData = this.tableData.filter(row => {
      return Object.values(row).some((val:any) => 
        val.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });

    this.currentPage = 1; // Reset to the first page after search
    this.updatePagination();
  }

    // Sorting functionality
    onSort(column: string): void {
      if (this.sortColumn === column) {
        // Toggle sort direction
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
      this.sortData();
      this.updatePagination();

      setTimeout(() => {
       this.sortColumn = '';
      }, 10000);
    }

    private sortData(): void {
      this.tableData.sort((a, b) => {
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      this.filteredData = this.tableData;
    }

      // Pagination functionality
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedData = this.filteredData.slice(startIndex, endIndex);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNextPage(): void {
    const totalPages = Math.ceil(this.tableData.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.tableData.length / this.itemsPerPage);
  }

    // Handle Button Click
    onActionClick(actionKey: string, row: any) {
      const action = this.actionsConfig.find(a => a.key === actionKey);
      if (action && action.visible !== false) {
        // console.log(`Action "${actionKey}" triggered for:`, row);
        this.actionTriggered.emit({ action: actionKey, row });
        // Implement dynamic action execution
      } else {
        console.error(`Action "${actionKey}" is not configured or not visible.`);
      }
    }

      // Helper to filter visible actions
  getVisibleActions() {
    return this.actionsConfig.filter(action => action.visible !== false);
  }
  
    // Function to check if a column should be visible
    isColumnVisible(columnKey: string): boolean {
      // Check if showColumns is an array of objects and extract the key values
      if (this.showColumns && this.showColumns.length > 0 && typeof this.showColumns[0] === 'object') {
        // Assuming showColumns is an array of objects like [{ key: 'name' }, { key: 'fee' }]
        return this.showColumns.some((col:any) => col.key === columnKey);
      }
    
      // Default behavior if showColumns is just an array of strings
      return this.showColumns.includes(columnKey);
    }
}
