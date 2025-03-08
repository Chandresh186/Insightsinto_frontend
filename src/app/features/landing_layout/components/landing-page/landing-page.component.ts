import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BlogService } from '../../../../core/services/blog.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { DailyEditorialLandingPageComponent } from '../../../pages/daily-editorial-landing-page/daily-editorial-landing-page.component';
import { environment } from '../../../../../environments/environment.development';
import { TestSeriesLandingPageComponent } from '../../../pages/test-series-landing-page/test-series-landing-page.component';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { CourseService } from '../../../../core/services/course.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule,RouterModule, NgbModule, DailyEditorialLandingPageComponent, TestSeriesLandingPageComponent, CarouselModule ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingPageComponent implements OnInit{
  public  isNavActive = false;
  public isLightTheme = true;

  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public blogs: any = [];
  public tags:  any = [];
  tableData:any = [];
  public staticBaseUrl = environment.staticBaseUrl;

  customOptions: OwlOptions = {
      loop: true,
      mouseDrag: false,
      touchDrag: false,
      pullDrag: false,
      dots: true,
      navSpeed: 700,
      navText: ['', ''],
      responsive: {
        // 0: {
        //   items: 1
        // },
        // 400: {
        //   items: 2
        // },
        // 740: {
        //   items: 3
        // },
        // 940: {
        //   items: 4
        // }
        0: {
          items: 1, // Extra small screens (phones)
        },
        576: {
          items: 2, // Small screens (phones, landscape orientation)
        },
        768: {
          items: 3, // Medium screens (tablets)
        },
        992: {
          items: 4, // Large screens (desktops)
        },
        1200: {
          items: 5, // Extra large screens (wide desktops)
        },
        1400: {
          items: 6, // Ultra-wide screens
        },
      },
      nav: false,
      autoplay: true,
    }

  constructor(private blogService : BlogService, private courseService : CourseService,) {}

  ngOnInit() {
    this.getBlogs();

    this.loadAllCourses();
    
    if(this.getUserId() !== null) {
      this.loadUserAllCourses(this.getUserId());
    }
  }


  private loadUserAllCourses(userId: any): void {
    this.loading = true; // Set loading state to true while fetching data
  
    this.courseService.getAllUserCourses(userId).pipe(
      tap((response: any) => {
       
        const courseIds = response.map((item: any) => item.id);
        
        this.courseService.setCourses(courseIds);
        // this.allCourses = response
        
      }),
      catchError((error) => {
        this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
        console.error('Error loading Daily editorials:', error);
        // this.allCourses = []; 
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
      })
    ).subscribe();
  }


  private loadAllCourses(): void {
    this.loading = true; // Set loading state to true while fetching data
  
    this.courseService.getAllActiveCoursesForPublic(true).pipe(
      tap((response: any) => {

        const courses = this.courseService.getCourses();
        
        var filteredData = null;
        if(courses && courses.length > 0) {
         filteredData = response.filter((item : any) => !courses.includes(item.id));

        } else {
          filteredData = response
        }

        this.tableData = filteredData;
        

        // this.tableData = filteredData; // Assign the fetched data to the list
        // this.showColumns  = this.generateTableHeaders(filteredData.map(({ id,courseMaterials,isActive,parentDetails,parentId,testDetails,testId,updatedAt,video, isOfflineTest, ...rest }: any) => rest));
        // this.tableHeaders = this.generateTableHeaders(filteredData)


        // this.tableData = response; // Assign the fetched data to the list
        // this.showColumns  = this.generateTableHeaders(response.map(({ id,courseMaterials,isActive,parentDetails,parentId,testDetails,testId,updatedAt,video, ...rest }: any) => rest));
        // this.tableHeaders = this.generateTableHeaders(response)
      }),
      catchError((error) => {
        this.errorMessage = 'Error loading test series.'; // Handle error message
        console.error('Error loading test series:', error);
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
      })
    ).subscribe();
  }

  getUserId() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return currentUser?.response?.userId ?? null;
  }

  toggleNav() {
    this.isNavActive = !this.isNavActive;
  }


  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    document.body.classList.toggle('light-theme', this.isLightTheme);
    document.body.classList.toggle('dark-theme', !this.isLightTheme);
  }



   getBlogs(): void {
        this.loading = true;  // Set loading state to true while fetching data
        this.blogService.getBlogs().pipe(
          tap(response => {
            this.blogs = response.slice(0, 3);  // Assign the fetched categories to the categories array
            // this.filteredBlogs = this.blogs;
            // Get all tags from blogs and remove duplicates based on id
             this.tags = Array.from(
              new Set(response.flatMap((blog: any) => blog.tags.map((tag:any) => JSON.stringify(tag))))
            ).map(tag => JSON.parse(tag as any) );

          }),
          catchError(error => {
            this.errorMessage = 'Failed to load Blogs.';
            console.error('Error fetching Blogs:', error);
            this.blogs = [];
            this.tags = [];
            return of([]);  // Return an empty array if there's an error
          }),
          finalize(() => {
            this.loading = false;  // Reset loading state when the request is completed
          })
        ).subscribe();
      }







       // Function to calculate time ago
  getTimeAgo(date: string): string {
    const now = new Date();
    const timeDifference = now.getTime() - new Date(date).getTime(); // in milliseconds

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
    if (months > 0) {
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    if (days > 0) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }
    if (hours > 0) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    if (minutes > 0) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }
    return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
  }
}
