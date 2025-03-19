import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private activeRequests = 0; // Counter for active API requests

  constructor(private spinner: NgxSpinnerService) {}

  show(): void {
    if (this.activeRequests === 0) {
      this.spinner.show(); // Show spinner only when no requests are active
    }
    this.activeRequests++;
  }

  hide(): void {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0; // Reset counter
      this.spinner.hide();
    }
  }
 
}
