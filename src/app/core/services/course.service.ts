import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpService } from './http.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api.constant';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private baseUrl = environment.URL;
  private courseData: any; // Array to hold the course data

  constructor(
    private httpService: HttpService<any>,
    private http: HttpClient
  ) {}

  private getHeaders(): HttpHeaders {
    const token: string = JSON.parse(
      localStorage.getItem('currentUser') as string
    )?.response?.token;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }




  private getHeadersFormData(): HttpHeaders {
    const token: string = JSON.parse(
      localStorage.getItem('currentUser') as string
    )?.response?.token;
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAllCourses(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpService.get(
      `${this.baseUrl}${API_CONSTANTS.Courses.GET_ALL_COURSES}`,
      headers
    );
  }


  setCourses(data: any[]) {
    this.courseData = data;
    
  }

  // Get data from the service
  getCourses() {
    return this.courseData;
  }

  getAllUserCourses(id: any): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpService.get(
      `${this.baseUrl}${API_CONSTANTS.Courses.GET_ALL_USER_COURSES(id)}`,
      headers
    );
  }

  getAllActiveCourses(IsActive: boolean): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpService.get(
      `${this.baseUrl}${API_CONSTANTS.Courses.GET_ALL_ACTIVE_COURSES(IsActive)}`,
      headers
    );
  }

  getAllActiveCoursesForPublic(IsActive: boolean): Observable<any[]> {
    // const headers = this.getHeaders();
    return this.httpService.get(
      `${this.baseUrl}${API_CONSTANTS.Courses.GET_ALL_ACTIVE_COURSES(IsActive)}`,
      // headers
    );
  }

  getYouTubeLink(): Observable<any[]> {
    // const headers = this.getHeaders();
    return this.httpService.get(
      `${this.baseUrl}${API_CONSTANTS.YOUTUBE.GET_ALL_YOUTUBE_LINK}`,
      // headers
    );
  }

  addOrUpdateYoutubeLink(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.YOUTUBE.YOUTUBE_LINK_ADD_OR_UPDATE}`, data, headers);
  }

  getAllCourseChaptersById(id: any): Observable<any[]> {
    const headers = this.getHeaders();
    return this.httpService.get(
      `${this.baseUrl}${API_CONSTANTS.Courses.GET_CHAPTERS_COURSES_BY_COURSEID(id)}`,
      headers
    );
  }

  // GET_CHAPTERS_COURSES_BY_COURSEID

  createCourse(data: any) {
    const headers = this.getHeadersFormData();
    const formData: any = new FormData();
    // Append scalar fields

  
    formData.append('Name', data.Name);
    formData.append('IsActive', data.IsActive);

    // formData.append('TestSeriesId', data.TestSeriesId);
    // formData.append('ParentId', data.ParentId);

    if(data.TestId !== null) {
      formData.append('TestId', data.TestId);
    }
    
    formData.append('IsOfflineTest', data.IsOfflineTest);
     
    if(data.ParentId !== null) {
      formData.append('ParentId', data.ParentId);

    }

    if(data.Fee !== null) {
      formData.append('Fee', data.Fee);
    }

    formData.append('Description', data.Description);
  
      // Append files
    if (data.Files && data.Files.length > 0) {
      data.Files.forEach((file: File) => {
        formData.append('Files', file); // Add file name if necessary
      });
    }
  
  
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.Courses.CREATE_COURSE}`, formData, headers);
  }


  editCourse(id:any, data: any) {
    const headers = this.getHeadersFormData();
    const formData: any = new FormData();
    // Append scalar fields

  
    formData.append('Name', data.Name);
    formData.append('IsActive', data.IsActive);

    if(data.TestId !== null) {
      formData.append('TestId', data.TestId);

    }

    formData.append('IsOfflineTest', data.IsOfflineTest);
     
    if(data.ParentId !== null) {
      formData.append('ParentId', data.ParentId);

    }

    if(data.Fee !== null) {
      formData.append('Fee', data.Fee);
    }

    formData.append('Description', data.Description);
  
      // Append files
    if (data.Files && data.Files.length > 0) {
      data.Files.forEach((file: File) => {
        formData.append('Files', file); // Add file name if necessary
      });
    }
  
  
    return this.httpService.update(`${this.baseUrl}${API_CONSTANTS.Courses.UPDATE_COURSE_BY_ID(id)}`, formData, headers);
  }


  getCourseById(id: any): Observable<any> {
    const headers = this.getHeaders()
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.Courses.GET_COURSE_BY_ID(id)}`, headers );
  }

  getCourseByTestId(id: any): Observable<any> {
    const headers = this.getHeaders()
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.Courses.GET_COURSE_BY_TEST_ID(id)}`, headers );
  }

  getPublicCourseById(id: any): Observable<any> {
    const headers = this.getHeaders()
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.Courses.GET_PUBLIC_COURSE_BY_ID(id)}`, headers );
  }

  getCourseMaterialById(id: any): Observable<any> {
    const headers = this.getHeaders()
    return this.httpService.getById(`${this.baseUrl}${API_CONSTANTS.Courses.GET_ALL_COURSE_Material_BY_ID(id)}`, headers );
  }

  deleteCourseMaterial(id: any): Observable<void> {
    const headers = this.getHeaders();
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.Courses.DELETE_COURSE_Material_BY_ID(id)}`, headers);
  }


  deleteCourse(id: any): Observable<void> {
    const headers = this.getHeaders();
    return this.httpService.delete(`${this.baseUrl}${API_CONSTANTS.Courses.DELETE_COURSE_BY_ID(id)}`, headers);
  }

  updateCourseMaterial(data: any) {
    const headers = this.getHeadersFormData();
    const formData: any = new FormData();
    // Append scalar fields
    formData.append('Id', data.Id);
      // Append files
    if (data.Files && data.Files.length > 0) {
      data.Files.forEach((file: File) => {
        formData.append('Files', file); // Add file name if necessary
      });
    }
  
  
    return this.httpService.post(`${this.baseUrl}${API_CONSTANTS.Courses.Update_COURSE_MATERIAL}`, formData, headers);
  }

  getVideo(url: string): Observable<File> {
    return this.http.get(url, { 
      responseType: 'blob', 
   
      // headers: new HttpHeaders({
      //   'Accept': 'video/*' // Specify that the response is expected to be a video
      // })
    }).pipe(
      map((blob) => {
        const fileName = url.split('/').pop() || 'video.mp4'; // Extract file name from URL or use default
        return new File([blob], fileName, { type: blob.type }); // Convert Blob to File
      })
    );
  }

  // getImage(url: any) {
  //   // Fetch the image as a blob without Authorization header
  //   return fetch(url, {
  //     method: 'GET',
  //   })
  //     .then(response => {
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch the image');
  //       }
  //       return response.blob(); // Get the blob from the response
  //     })
  //     .then(blob => {
  //       const fileName = url.split('/').pop() || 'image.jpg'; // Extract file name from URL or use default
  //       return new File([blob], fileName, { type: blob.type }); // Convert Blob to File
  //     })
  //     .catch(error => {
  //       console.error('Error fetching the image:', error);
  //     });
  // }
  
  fetchMedia(url: any) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch the media');
        }
        return response.blob(); // Get the media as a Blob (image, video, etc.)
      })
      .then(blob => {
        return blob; // Return the Blob (image/video data)
      })
      .catch(error => {
        console.error('Error fetching the media:', error); // Handle errors (e.g., network issues)
        throw error; // Optionally throw the error for further handling if needed
      });
  }

 
}
