import { Component, OnInit, TemplateRef, ViewChild, } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import { CommonModule } from '@angular/common';
import { QuestionService } from '../../../core/services/question.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { CourseService } from '../../../core/services/course.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-youtube-link-management',
  standalone: true,
  imports: [CommonModule, TableComponent, RouterModule, ReactiveFormsModule],
  templateUrl: './youtube-link-management.component.html',
  styleUrl: './youtube-link-management.component.scss',
})
export class YoutubeLinkManagementComponent implements OnInit {
  @ViewChild('content', { static: true }) modalTemplate!: TemplateRef<any>;
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages

  public tableHeaders: any = [];
  public showColumns: any;
  public tableData: any = [];
  public youtubeVideoLink: any;

  constructor(
    public sanitizer: DomSanitizer,
    private questionServcie: QuestionService,
    private router: Router,
    private courseService: CourseService,
    private modalService: NgbModal
  ) {}

  youtubeForm = new FormGroup({
    id: new FormControl('', [Validators.required,]),
    videoLink: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/)
    ])
  });

  onSubmit() {
    if (this.youtubeForm.valid) {
      console.log('Submitted:', this.youtubeForm.value);
              this.courseService
          .addOrUpdateYoutubeLink(this.youtubeForm.value)
          .pipe(
            tap((response: any) => {
              console.log(response);
            }),
            catchError((error) => {
              this.errorMessage = 'Error uploading questions.'; // Handle error message
              console.error('Error uploading questions:', error);
              return of([]); // Return an empty array in case of an error
            }),
            finalize(() => {

              this.modalService.dismissAll();
              this.loading = false; // Reset loading state when the request is completed
              this.getYouTubeLink();
            })
          )
          .subscribe();
    } else {
      this.youtubeForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    this.getYouTubeLink();
  }

  // downloadCSV() {
  //   const csvFilePath = 'assets/question_bank.csv'; // Update with your CSV file name
  //   const link = document.createElement('a');
  //   link.href = csvFilePath;
  //   link.download = 'question-template.csv'; // Set the downloaded file name
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

  // onFileSelected(event: Event) {
  //   this.loading = true;
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     const file = input.files[0];

  //     if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
  //       alert('Please select a valid CSV file.');
  //       return;
  //     }

  //     console.log('Selected file:', file);
  //     if (file !== null) {
  //       this.questionServcie
  //         .uploadCsv(file)
  //         .pipe(
  //           tap((response: any) => {
  //             console.log(response);
  //           }),
  //           catchError((error) => {
  //             this.errorMessage = 'Error uploading questions.'; // Handle error message
  //             console.error('Error uploading questions:', error);
  //             return of([]); // Return an empty array in case of an error
  //           }),
  //           finalize(() => {
  //             this.loading = false; // Reset loading state when the request is completed
  //             this.loadQuestions();
  //           })
  //         )
  //         .subscribe();
  //     }
  //     // Perform further processing (upload, read, etc.)
  //   }
  // }

  actionConfig = [
    {
      key: 'edit',
      label: 'Edit',
      class: 'btn btn-outline-info',
      visible: true,
    },
  ];

  handleAction(event: { action: string; row: any }) {
    switch (event.action) {
      case 'edit':
        this.onEdit(event.row);
        break;
      default:
        console.error('Unknown action:', event.action);
    }
  }

  // private loadQuestions(): void {
  //   this.loading = true; // Set loading state to true while fetching data

  //   this.questionServcie
  //     .getAllQuestions()
  //     .pipe(
  //       tap((response: any) => {
  //         console.log(response);
  //         this.tableData = response; // Assign the fetched data to the list
  //         this.showColumns = this.generateTableHeaders(
  //           response.map(
  //             ({ id, categoryId, marks, negativeMarks, ...rest }: any) => rest
  //           )
  //         );
  //         this.tableHeaders = this.generateTableHeaders(response);
  //       }),
  //       catchError((error) => {
  //         this.errorMessage = 'Error loading questions.'; // Handle error message
  //         console.error('Error loading questions:', error);
  //         return of([]); // Return an empty array in case of an error
  //       }),
  //       finalize(() => {
  //         this.loading = false; // Reset loading state when the request is completed
  //       })
  //     )
  //     .subscribe();
  // }

  generateTableHeaders(
    dataArray: any[]
  ): {
    key: string;
    displayName: string;
    pipe: string | null;
    pipeFormat: string | null;
  }[] {
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
        pipe = 'currency'; // The pipe name for fee is currency
        pipeFormat = 'INR'; // No special formatting for 'currency' pipe
      }
      // Add 'date' pipe for 'startDate' column
      else if (key === 'startDate') {
        pipe = 'date'; // The pipe name for startDate is date
        pipeFormat = 'd MMM, y'; // Custom format for date (can be changed as needed)
      }

      return {
        key: key,
        displayName: formatDisplayName(key),
        pipe: pipe,
        pipeFormat: pipeFormat,
      };
    });
  }

  onEdit(val: any) {
    // this.router.navigateByUrl(`dash/edit-question/${val.id}`);
    this.youtubeForm.patchValue({
      id: val.id,
      videoLink: val.videoLink
    })
    this.modalService.open(this.modalTemplate);
  }

  private getYouTubeLink(): void {
    this.loading = true; // Set loading state to true while fetching data

    this.courseService
      .getYouTubeLink()
      .pipe(
        tap((response: any) => {
          this.tableData = response; // Assign the fetched data to the list
          this.showColumns = this.generateTableHeaders(
            response.map(({ id, ...rest }: any) => rest)
          );
          this.tableHeaders = this.generateTableHeaders(response);
          this.youtubeVideoLink = this.sanitizer.bypassSecurityTrustResourceUrl(
            response[0].videoLink
          );
          console.log(this.youtubeVideoLink);
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading test series.'; // Handle error message
          console.error('Error loading test series:', error);
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
        })
      )
      .subscribe();
  }
}

