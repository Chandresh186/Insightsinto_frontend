import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import Quill from 'quill';

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


initilizeEditor() {
  setTimeout(() => {
  this.questions.forEach((mcq: any, index: any) => {
    this.initializeQuill(`quill-question-${index}`, mcq.question);
    this.initializeQuill(`quill-optionA-${index}`, mcq.a);
    this.initializeQuill(`quill-optionB-${index}`, mcq.b);
    this.initializeQuill(`quill-optionC-${index}`, mcq.c);
    this.initializeQuill(`quill-optionD-${index}`, mcq.d);
  });
  }, 100)
}

initializeQuill(elementId: string, content: string) {
  const container = document.getElementById(elementId);
  if (container) {
    const quill = new Quill(container, {
      theme: 'snow',
      readOnly: true,
      modules: { toolbar: [] }
    });
    quill.root.innerHTML = content;
  }
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
            this.initilizeEditor();
            
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
