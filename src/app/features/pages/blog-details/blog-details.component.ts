import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { DomSanitizer } from '@angular/platform-browser';
import Quill from 'quill';
import { ShareButtons } from 'ngx-sharebuttons/buttons';

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ShareButtons],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss'
})
export class BlogDetailsComponent {

  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public blogData: any
  public staticBaseUrl = environment.staticBaseUrl;
  public isUserLoggedIn!: boolean;
  public quillEditor: Quill | undefined;

  constructor(private route : ActivatedRoute, private blogService : BlogService, private router: Router, private cdr: ChangeDetectorRef,public sanitizer: DomSanitizer) {}


  getBlogId() {
    return this.route.snapshot.params['id']
  }

  ngOnInit() {
    this.quillEditor = new Quill('#editor', {
      theme: 'snow',
      readOnly: true,
      // placeholder: 'Write your blog content here...',
      modules: {
        toolbar: [
        //   // Font family
        //   [{ font: [] }],

        //   // Font size
        //   [{ size: [] }],

        //   // Text formatting
        //   ['bold', 'italic', 'underline', 'strike'], // Bold, italic, underline, strike
        //   [{ script: 'sub' }, { script: 'super' }], // Subscript, superscript
        //   [{ color: [] }, { background: [] }], // Text and background colors

        //   // Headers and block styles
        //   [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers (H1-H6)
        //   ['blockquote', 'code-block'], // Blockquote and code block

        //   // Lists and Indentation
        //   [{ list: 'ordered' }, { list: 'bullet' }], // Ordered and unordered lists
        //   [{ indent: '-1' }, { indent: '+1' }], // Indentation

        //   // Alignment and Direction
        //   [{ align: [] }], // Align left, center, right, justify
        //   [{ direction: 'rtl' }], // RTL text direction

        //   // Links, media, and more
        //   ['link', 'image', 'video', 'formula'], // Links, images, videos, formulas

        //   ['table'], // Table operations

        //   // Clear formatting
        //   ['clean'], // Clear formatting
        ],
        // table: true, // Enable table module
      },
    });
    this.isUserLoggedIn = localStorage.getItem('currentUser') !== null;
    this.getBlogs(this.getBlogId());
    
  }


   getBlogs(id: any): void {
        // this.blogData = null;
        this.loading = true;  // Set loading state to true while fetching data
        this.blogService.getBlogById(id).pipe(
          tap(response => {
            this.blogData = response;  // Assign the fetched categories to the categories array
            if (this.quillEditor && this.quillEditor.root) {

              this.quillEditor.root.innerHTML = response.blogContent
            }
            this.cdr.detectChanges();
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
