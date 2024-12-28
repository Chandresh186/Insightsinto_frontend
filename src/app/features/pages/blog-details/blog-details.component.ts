import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss'
})
export class BlogDetailsComponent {

  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public blogData: any
  

  constructor(private route : ActivatedRoute, private blogService : BlogService, private router: Router) {}


  getBlogId() {
    return this.route.snapshot.params['id']
  }

  ngOnInit() {
    this.getBlogs();
  }


   getBlogs(): void {
        this.loading = true;  // Set loading state to true while fetching data
        this.blogService.getBlogById(this.getBlogId()).pipe(
          tap(response => {
            this.blogData = response;  // Assign the fetched categories to the categories array
          }),
          catchError(error => {
            this.errorMessage = 'Failed to load Blogs.';
            console.error('Error fetching Blogs:', error);
            return of([]);  // Return an empty array if there's an error
          }),
          finalize(() => {
            this.loading = false;  // Reset loading state when the request is completed
          })
        ).subscribe();
      }
}
