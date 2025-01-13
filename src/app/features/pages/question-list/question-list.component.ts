import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../../../core/services/question.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, TableComponent,RouterModule],
  templateUrl: './question-list.component.html',
  styleUrl: './question-list.component.scss'
})
export class QuestionListComponent implements OnInit {
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages

  public tableHeaders:any = [];
  public showColumns: any;
  public tableData:any = [];

  constructor(private questionServcie : QuestionService, private router: Router) {}

  ngOnInit() {
    this.loadQuestions();
  }

  actionConfig = [
    { key: 'edit', label: 'Edit', class: 'btn btn-outline-info', visible: true },
    { key: 'delete', label: 'Delete', class: 'btn btn-outline-danger', visible: true },
  ];

  handleAction(event: { action: string; row: any }) {
    switch (event.action) {
     
      case 'edit':
        this.onEdit(event.row);
        break;
      case 'delete':
        this.onDelete(event.row);
        break;
      
    
      default:
        console.error('Unknown action:', event.action);
    }
  }

  private loadQuestions(): void {
        this.loading = true; // Set loading state to true while fetching data
      
        this.questionServcie.getAllQuestions().pipe(
          tap((response: any) => {
            console.log(response)
            this.tableData = response; // Assign the fetched data to the list
            this.showColumns  = this.generateTableHeaders(response.map(({ id,categoryId, ...rest }: any) => rest));
            this.tableHeaders = this.generateTableHeaders(response)
          }),
          catchError((error) => {
            this.errorMessage = 'Error loading questions.'; // Handle error message
            console.error('Error loading questions:', error);
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


      onEdit(val:any) {
        this.router.navigateByUrl(`dash/edit-question/${val.id}`)
      }

      onDelete(val:any) {
        
        this.loading = true; // Set loading state to true while fetching data
      
        this.questionServcie.deleteQuestion(val.id).pipe(
          tap((response: any) => {
           
            // this.tableData = response; // Assign the fetched data to the list
            // this.showColumns  = this.generateTableHeaders(response.map(({ id,categoryId, ...rest }: any) => rest));
            // this.tableHeaders = this.generateTableHeaders(response)
          }),
          catchError((error) => {
            this.errorMessage = 'Error deleting questions.'; // Handle error message
            console.error('Error deleting questions:', error);
            return of([]); // Return an empty array in case of an error
          }),
          finalize(() => {
            this.loading = false; // Reset loading state when the request is completed
            this.loadQuestions()
          })
        ).subscribe();
      }
}
