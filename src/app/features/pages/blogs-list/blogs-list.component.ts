import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment.development';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-blogs-list',
  standalone: true,
  imports: [RouterModule, CommonModule, ngbootstrapModule],
  templateUrl: './blogs-list.component.html',
  styleUrl: './blogs-list.component.scss'
})
export class BlogsListComponent implements OnInit {
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public blogs: any = [];
  public searchQuery!: string ; // Holds the search query
  public filteredBlogs: any = [];
  public staticBaseUrl = environment.staticBaseUrl;

  constructor(private blogService : BlogService, private router: Router, private _authService : AuthService){}

  ngOnInit() {
    this.getBlogs();
  }

  public checkRole(role: string): boolean {
    return this._authService.checkRole(role);
  }

  onSearch(event: any): void {
    const query = event.target.value.toLowerCase();
    this.filteredBlogs = this.blogs.filter((blog: any) => 
      blog.title.toLowerCase().includes(query) ||
      blog.blogContent.toLowerCase().includes(query) ||
      blog.tags.some((tag: any) => tag.catName.toLowerCase().includes(query))
    );
  }

   getBlogs(): void {
      this.loading = true;  // Set loading state to true while fetching data
      this.blogService.getBlogs().pipe(
        tap(response => {
          this.blogs = response;  // Assign the fetched categories to the categories array
          this.filteredBlogs = this.blogs;
        }),
        catchError(error => {
          this.errorMessage = 'Failed to load Blogs.';
          console.error('Error fetching Blogs:', error);
          this.blogs = [];
          return of([]);  // Return an empty array if there's an error
        }),
        finalize(() => {
          this.loading = false;  // Reset loading state when the request is completed
        })
      ).subscribe();
    }


    deleteBlog(id: any) {
      this.loading = true;  // Set loading state to true while fetching data
      this.blogService.deleteBlog(id).pipe(
        tap(response => {
          this.blogs = response;  // Assign the fetched categories to the categories array
        }),
        catchError(error => {
          this.errorMessage = 'Failed to delete Blogs.';
          console.error('Error deleting Blogs:', error);
          this.blogs = [];
          return of([]);  // Return an empty array if there's an error
        }),
        finalize(() => {
          this.loading = false;  // Reset loading state when the request is completed
          this.getBlogs();
        })
      ).subscribe();
    }
}
