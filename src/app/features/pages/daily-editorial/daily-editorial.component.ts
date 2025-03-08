import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EditorialService } from '../../../core/services/editorial.service';
import { catchError, finalize, of, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PdfWatermarkService } from '../../../core/services/pdf-watermark.service';
import { VideoPlayerComponent } from "../../../shared/resusable_components/video-player/video-player.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { PaymentService } from '../../../core/services/payment.service';
import { Router } from '@angular/router';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { environment } from '../../../../environments/environment.development';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-daily-editorial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VideoPlayerComponent, ngbootstrapModule],
  templateUrl: './daily-editorial.component.html',
  styleUrl: './daily-editorial.component.scss'
})
export class DailyEditorialComponent implements OnInit{

  dailyEditorialForm!: FormGroup;
  public loading = false;
  private errorMessage: string | null = null;
  public allEditoril: any = []
  public seePlans : boolean = false;
  public staticBaseUrl = environment.staticBaseUrl;
 //User's subscription is about to expire in {daysUntilExpiration} days.
  // public selectedFiles = {
  //   pdf: null as File | null,
  //   video: null as File | null,
  // };

  selectedFiles: { [key: string]: File | null } = {
    pdf: null,
    video: null
  };


  constructor(private toastr: ToastrService, private router : Router, private paymentService: PaymentService, private editorialService : EditorialService, private _authService : AuthService, private pdfWatermarkService: PdfWatermarkService, private modalService : NgbModal) {}

  ngOnInit(): void {
    // Initialize the form with validation
    this.dailyEditorialForm = new FormGroup({
      fileName : new FormControl('',Validators.required),
      pdf: new FormControl(null), // File is required
      video: new FormControl(null), // YouTube link validation
      date: new FormControl(null)
    });

    if(this.getUserRole() == 'User') {
      
      this.loadAllEditorialForUser(this.getUserId());
    } else {
      
      this.loadAllEditorial();
    }

  }

  get dailyEditorialFormControl() {
    return this.dailyEditorialForm.controls;
  }

  getUserRole() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null').response.role
  }

  getUserId() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId
  }

  public checkRole(role: string): boolean {
    return this._authService.checkRole(role);
  }

 
  public onFileChange(event: any): void {
    const files: any = Array.from(event.target.files); // Convert the FileList to an array
  
    if (files.length === 0) {
      alert('Please select a file.');
      return;
    }

     // If more than one file is selected, reset the input field and show alert
     if (files.length > 1) {
      alert('You can only upload one file at a time.');
      event.target.value = ''; // Reset the input field
      return;
    }
  
    // Loop through the files to ensure only one PDF and one video
    for (const file of files ) {
      const isPDF = file.type === 'application/pdf';
      const isVideo = file.type.startsWith('video/');
  
      // Ensure the selected file is either a PDF or a video
      if (!isPDF && !isVideo) {
        alert('Only PDF or video files are allowed.');
        event.target.value = ''; // Reset the input field
        return;
      }
  
      // If the selected file is PDF and a PDF has already been uploaded
      if (isPDF && this.selectedFiles['pdf']) {
        alert('You can only upload one PDF file.');
        event.target.value = ''; // Reset the input field
        return;
      }
  
      // If the selected file is video and a video has already been uploaded
      if (isVideo && this.selectedFiles['video']) {
        alert('You can only upload one video file.');
        event.target.value = ''; // Reset the input field
        return;
      }
  
      // Add the file to the appropriate key in the selectedFiles object
      if (isPDF) {
        this.selectedFiles['pdf'] = file;
        
      } else if (isVideo) {
        this.selectedFiles['video'] = file;
      }
    }
    this.dailyEditorialForm.patchValue({ pdf: this.selectedFiles['pdf'], video: this.selectedFiles['video']  });
    event.target.value = ''
  }


  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }


  deleteFromUploadList(k: any, val:any) {
    const fileInput: any = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Reset the input value
    }
    this.selectedFiles[k] = null
    this.dailyEditorialForm.patchValue({[k]: null})
  }
  




  private resetFileControl(): void {
    this.dailyEditorialForm.get('pdf')?.setValue(null); // Clear the FormControl value
    this.dailyEditorialForm.get('video')?.setValue(null); // Clear the FormControl value
  
    // Reset the HTML file input element
    const fileInputElement = document.getElementById('files') as HTMLInputElement;
    if (fileInputElement) {
      fileInputElement.value = ''; // Clear the file input
    }

    this.selectedFiles['pdf'] = null;
    this.selectedFiles['video'] = null;
  }

  resetForm(): void {
    this.dailyEditorialForm.reset(); // Reset the form controls
    this.resetFileControl(); // Reset the file input separately
  }

    // Method to submit the form
    createEditorial() {
      const reqBody:any = {
        files: [this.dailyEditorialForm.get('pdf')?.value, this.dailyEditorialForm.get('video')?.value].filter(file => file !== null) ,
        fileName: this.dailyEditorialForm.get('fileName')?.value,
      }
      // If a date is provided, add it to the request body in UTC format
      const date = this.dailyEditorialForm.get('date')?.value;
      if (date) {
        reqBody.uploadDate = new Date(date).toISOString();
      }
      
    this.loading = true; // Set loading state to true while fetching data
  
    this.editorialService.createDailyEditorial(reqBody).pipe(
      tap((response: any) => {
      }),
      catchError((error) => {
        this.errorMessage = 'Error creating Daily editorial.'; // Handle error message
        console.error('Error creating Daily editorial:', error);
        this.toastr.warning(error.error, "Warning", {
          progressBar: true
        }) ;
        return of([]); // Return an empty array in case of an error
      }),
      finalize(() => {
        this.loading = false; // Reset loading state when the request is completed
        this.resetForm();
        this.loadAllEditorial();
       
      })
    ).subscribe();
    }

    // async downloadFile(filePath: string) {
      // if (filePath) {

      //   // Fetch the original PDF (replace with your PDF path or bytes)
      //   const response = await fetch('/assets/pdf/20241211_091814.pdf');
      //   const pdfBytes = await response.arrayBuffer();

      //   // Add watermark
      //   const watermarkedPdf = await this.pdfWatermarkService.addWatermarkToPdf(
      //     new Uint8Array(pdfBytes),
      //     'CONFIDENTIAL'
      //   );

      //   // Trigger download
      //   const blob = new Blob([watermarkedPdf], { type: 'application/pdf' });
      //   const link = document.createElement('a');
      //   link.href = URL.createObjectURL(blob);
      //   link.download = 'watermarked.pdf'; // This will prompt the browser to download the file with the filename in the URL
      //   link.click();
      // } else {
      //   console.error('File path is invalid or missing.');
      // }



      
    // }


    async downloadFile(filePath: string, fileName: string): Promise<void> {
      try {
        // Fetch the original PDF (replace with your PDF path or bytes)
        
        const response = await fetch(this.staticBaseUrl+filePath);
        if (!response.ok) {
          console.error('Failed to fetch PDF:', response.statusText);
          return;
        }
        const pdfBytes = await response.arrayBuffer();
  
        // Check if the PDF is valid by checking the first few bytes for the PDF header
        const pdfHeader = new TextDecoder().decode(pdfBytes.slice(0, 5));
        if (pdfHeader !== '%PDF-') {
          console.error('Invalid PDF file');
          return;
        }
  
        // Add watermark
        const watermarkedPdf = await this.pdfWatermarkService.addWatermarkToPdf(
          new Uint8Array(pdfBytes),
          JSON.parse(localStorage.getItem('currentUser') as string)?.response.email.toUpperCase()
        );
  
        // Trigger download
        const blob = new Blob([watermarkedPdf], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.pdf`; // This will prompt the browser to download the file with the filename in the URL
        link.click();
  
      } catch (error) {
        console.error('Error during watermarking process:', error);
      }
    }




    private loadAllEditorial(): void {
      this.loading = true; // Set loading state to true while fetching data
    
      this.editorialService.getAllEditorials().pipe(
        tap((response: any) => {
          this.allEditoril = response
          
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
          console.error('Error loading Daily editorials:', error);
          this.allEditoril = []; 
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
        })
      ).subscribe();
    }


    private loadAllEditorialForUser(id: any): void {
      this.loading = true; // Set loading state to true while fetching data
    
      this.editorialService.getAllEditorialsUser(id).pipe(
        tap((response: any) => {
          // response.sort((a: any, b: any) => a.uploadDate - b.uploadDate);
          response.sort((a: any, b: any) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
          
          this.allEditoril = response
          
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading Daily editorials.'; // Handle error message
          console.error('Error loading Daily editorials:', error);
          this.allEditoril = []; 
          return of([]); // Return an empty array in case of an error
        }),
        finalize(() => {
          this.loading = false; // Reset loading state when the request is completed
        })
      ).subscribe();
    }


    public deleteEditorial(id: any) {

    this.loading = true; // Start loading
   

    this.editorialService.deleteEditorial(id)
      .pipe(
        tap((response) => {
          
        }),
        catchError((error) => {
          console.error('Error:', error);
          return of(error); // Return an observable to handle the error
        }),
        finalize(() => {
          
        
          this.loading = false; // Stop loading
         
          this.loadAllEditorial();
        })
      )
      .subscribe();
    }

    openPlayer(link: any) {
      const modalRef = this.modalService.open(VideoPlayerComponent);
      modalRef.componentInstance.link = this.staticBaseUrl+link;
    }




    onBuy(planType: any, newPrice: any, name: any) {
      let row = {
        fee : newPrice,
        planType : planType,
        name : `Today’s Editorial Program – ${name}`

      };
      
      
      this.paymentService.setSelectedProductForCheckout(row);

      const userId = JSON.parse(localStorage.getItem('currentUser') || 'null').response.userId;

      const product = {
        userid: userId,
        productid: '',
        moduleType: 'dailyeditorial'
      }
      localStorage.setItem('product', JSON.stringify(product));
      this.paymentService.setSelectedProductForCheckout(row);
      this.router.navigateByUrl(`/dash/payment/checkout/${userId}`); // Navigate to checkout
      
      // const paymentOrderData: PaymentOrder = {
      //   amount: row.fee, // Use the validated amount
      //   currency: 'INR',
      //   receipt: userId, // Use response ID as receipt
      //   productId: row.id
      // };

      // this.loading = true; // Set loading state to true while fetching data
    
      // this.paymentService.createOrder(paymentOrderData).pipe(
      //   tap((response: any) => {
      //     this.orderId = response.data.orderId; // Assuming orderResponse contains an 'id' field
      //     const product = {
      //       userid: response.data.userId,
      //       productid: response.data.productId,
      //       moduleType: 'testseries'
      //     }
      //     localStorage.setItem('product', JSON.stringify(product));
      //     this.paymentService.setSelectedProductForCheckout(row);
      //     this.router.navigateByUrl(`/payment/checkout/${this.orderId}`); // Navigate to checkout

       
      //   }),
      //   catchError((error) => {
      //     this.errorMessage = 'Error creating purchase order.'; // Handle error message
      //     console.error('Error creating purchase order:', error);
      //     return of([]); // Return an empty array in case of an error
      //   }),
      //   finalize(() => {
      //     this.loading = false; // Reset loading state when the request is completed
      //   })
      // ).subscribe();

     
     
    }
    
}


