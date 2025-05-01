import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import { promoValidationMessages } from '../../../core/constants/validation.constant';
import { CouponService } from '../../../core/services/coupon.service';
import { catchError, finalize, of, tap } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-promocode',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableComponent],
  templateUrl: './promocode.component.html',
  styleUrl: './promocode.component.scss',
})
export class PromocodeComponent {
  public createCoupon: boolean = false;
  public promoForm!: FormGroup;
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public validationErrorMessage = promoValidationMessages;
  public ShowColumns: any;
  public tableHeaders: any = [];
  public tableData = [
    {
      promoCode: 'SPRING20',
      discountPercentage: 20,
      validFrom: '2024-03-01',
      validUntil: '2024-05-31',
      isActive: true,
    },
    {
      promoCode: 'SUMMER15',
      discountPercentage: 15,
      validFrom: '2024-06-01',
      validUntil: '2024-08-31',
      isActive: false,
    },
  ];

  actionConfig = [
    {
      key: 'delete',
      label: 'Delete',
      class: 'btn btn-outline-danger',
      visible: true,
    },
  ];

  handleAction(event: { action: string; row: any }) {
    switch (event.action) {
      case 'delete':
        this.onDelete(event.row);
        break;

      default:
        console.error('Unknown action:', event.action);
    }
  }

  constructor(private couponService: CouponService) {}

  ngOnInit() {
    // Initialize the reactive form
    this.promoForm = new FormGroup({
      code: new FormControl('', [Validators.required]), // Promo code field with required validation
      discount: new FormControl('', [Validators.required]), // Discount field with validation
      validFrom: new FormControl('', Validators.required), // Date picker for valid from
      validUntil: new FormControl('', Validators.required), // Date picker for valid until
      isActive: new FormControl(), // Active checkbox default to false
    });

    this.getAllCoupons();
  }

  get promoFormControl() {
    return this.promoForm.controls;
  }

  handleInput(event: Event): void {
    const inputField = event.target as HTMLInputElement;

    // Get the current value of the input
    let currentValue = inputField.value;

    // Remove any non-alphanumeric characters (no spaces, special chars)
    currentValue = currentValue.replace(/[^a-zA-Z0-9]/g, '');

    // Ensure the first character is a letter
    if (currentValue.length > 0 && /^[0-9]/.test(currentValue[0])) {
      // Remove the invalid number if it's the first character
      currentValue = currentValue.slice(1);
    }

    // Separate letters and numbers
    const letters = currentValue.replace(/[^A-Za-z]/g, ''); // Extract only letters
    const numbers = currentValue.replace(/[^0-9]/g, ''); // Extract only numbers

    // Combine letters first, then numbers
    inputField.value = letters.toUpperCase() + numbers;
  }

  generateTableHeaders(
    dataArray: any[]
  ): {
    key: string;
    displayName: string;
    pipe: string | null;
    pipeFormat: string | null;
  }[] {
    if (!dataArray || dataArray.length === 0) {
      return [];
    }

    const formatDisplayName = (key: string): string =>
      key
        .replace(/([A-Z])/g, ' $1') // Add a space before uppercase letters (camelCase to spaced)
        .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter

    return Object.keys(dataArray[0]).map((key) => {
      let pipe = null;
      let pipeFormat = null;

      // Add 'currency' pipe for 'fee' column
      if (key === 'validUntil') {
        pipe = 'date'; // The pipe name for fee is currency
        pipeFormat = 'd MMM, y'; // No special formatting for 'currency' pipe
      }
      // Add 'date' pipe for 'startDate' column
      else if (key === 'validFrom') {
        pipe = 'date'; // The pipe name for startDate is date
        pipeFormat = 'd MMM, y'; // Custom format for date (can be changed as needed)
      }

      return {
        key: key,
        displayName: formatDisplayName(key),
        pipe: pipe,
        pipeFormat: pipeFormat,
      };
    });
  }

  CreateCoupon() {
    const payload = {
      code: this.promoForm.get('code')?.value.toUpperCase(), // Gets the value from the form input
      discountPercentage: this.promoForm.get('discount')?.value, // Get discount value from the form (replace 10 with dynamic value)
      validFrom: this.promoForm.get('validFrom')?.value
        ? new Date(this.promoForm.get('validFrom')?.value).toISOString()
        : null, // Converts the date from the form to ISO string
      validUntil: this.promoForm.get('validUntil')?.value
        ? new Date(this.promoForm.get('validUntil')?.value).toISOString()
        : null, // Converts the date from the form to ISO string
      isActive: this.promoForm.get('isActive')?.value, // Get the boolean value for active status
    };

    this.promoForm.value;

    this.loading = true; // Set loading state
    this.couponService
      .createCoupon(payload)
      .pipe(
        tap((response) => {
          this.promoForm.reset();
          this.createCoupon = false;
        }),
        catchError((error) => {
          this.errorMessage = 'Coupon failed. Please try again.'; // Handle error

          return of(null); // Return a default value to continue the stream
        }),
        finalize(() => {
          this.loading = false; // Reset loading state
          this.getAllCoupons();
        })
      )
      .subscribe();
  }

  getAllCoupons() {
    this.loading = true; // Set loading state
    this.couponService
      .getAllCoupons()
      .pipe(
        tap((response) => {
          this.tableData = response;
          this.ShowColumns = this.generateTableHeaders(
            this.tableData.map(({ id, ...rest }: any) => rest)
          );
          this.tableHeaders = this.generateTableHeaders(this.tableData);
        }),
        catchError((error) => {
          this.errorMessage = 'Coupon failed. Please try again.'; // Handle error

          return of(null); // Return a default value to continue the stream
        }),
        finalize(() => {
          this.loading = false; // Reset loading state
        })
      )
      .subscribe();
  }

  onDelete(val: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a1f35',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Set loading state to true while fetching data

        this.loading = true; // Set loading state
        this.couponService
          .deleteCoupon(val.id)
          .pipe(
            tap((response) => {
              Swal.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success',
                confirmButtonColor: '#1a1f35',
              });
            }),
            catchError((error) => {
              this.errorMessage = 'Coupon failed. Please try again.'; // Handle error
              return of(null); // Return a default value to continue the stream
            }),
            finalize(() => {
              this.loading = false; // Reset loading state
              this.getAllCoupons();
            })
          )
          .subscribe();
      }
    });
  }
}
