import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { TestSeriesService } from '../../../core/services/test-series.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-test-series',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-test-series.component.html',
  styleUrl: './user-test-series.component.scss'
})
export class UserTestSeriesComponent {
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public testSeriesData:any = [];

  constructor(private route : ActivatedRoute, private testSeriesService: TestSeriesService, private router : Router) {}

  ngOnInit() {
    const userId = JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId
    this.loadUserTestSeries(userId, this.getTestSeriesId())
  }

  getTestSeriesId() {
    return this.route.snapshot.params['id']
  }


    private loadUserTestSeries(userId: any, testSeriesId: any): void {
      this.loading = true; // Set loading state to true while fetching data
    
      this.testSeriesService.getTestSeriesByUserId(userId, testSeriesId).pipe(
        tap((response: any) => {
          console.log(response)
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
      this.router.navigateByUrl(`dash/series-details/${val.id}`);
      // this.router.navigateByUrl(`dash/test-series/test-series-details/${val.id}`);
    }
}
