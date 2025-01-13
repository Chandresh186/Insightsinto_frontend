import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-analysis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-analysis.component.html',
  styleUrl: './view-analysis.component.scss'
})
export class ViewAnalysisComponent implements OnInit{


  public loading = false;
  


  public questions: any = [
    
];

constructor(private testSeriesService: TestSeriesService, private route: ActivatedRoute,) {}

ngOnInit() {
  this.getAnalysis()
}

getTestId() {
  return this.route.snapshot.params['id'];
}

getUserId() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null').response
    .userId;
}

getAnalysis() {
  // const payload = {
  //       userId: this.getUserId(),
  //       testSeriesId: this.getTestSeriesId(),
  //       testId: val.id,
  //     };
  
      this.loading = true; // Start loading
  
      this.testSeriesService
        .getAnalysis(this.getUserId(),this.getTestId())
        .pipe(
          tap((response) => {
            this.questions = response;
            
          }),
          catchError((error) => {
            console.error('Error:', error);
            return of(error); // Return an observable to handle the error
          }),
          finalize(() => {
            this.loading = false; // Stop loading
  
           
          })
        )
        .subscribe();
}
}
