import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TableComponent } from '../../../shared/resusable_components/table/table.component';
import { Router, RouterLink } from '@angular/router';
import { ngbootstrapModule } from '../../../shared/modules/ng-bootstrap.modules';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { patternValidator } from '../../../shared/helper.service';
import { validationErrorMessage } from '../../../core/constants/validation.constant';
import { registerRequest } from '../../../core/models/interface/register_request.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    RouterLink,
    ngbootstrapModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserListComponent implements OnInit {
  public loading = false; // To track loading state
  private errorMessage: string | null = null; // To store error messages
  public signUpForm!: FormGroup;
  public hidePassword = true;
  public allRoles: any;
  public selectedRoleName: any;

  tableHeaders: any = [];

  tableData: any = [];

  public showColumns: any;

  actionsConfig = [
    {
      key: 'edit',
      label: 'Edit',
      class: 'btn btn-outline-primary',
      visible: false,
    },
    {
      key: 'delete',
      label: 'Delete',
      class: 'btn btn-outline-danger',
      visible: true,
    },
    {
      key: 'details',
      label: 'Details',
      class: 'btn btn-outline-info',
      visible: true,
    },
  ];

  public validationErrorMessage = validationErrorMessage;

  constructor(
    private authService: AuthService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit() {
    this.getRoles();
    this.loadAllUser();

    this.signUpForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl(
        '',
        Validators.compose([Validators.required, patternValidator()])
      ),
      userType: new FormControl('', [Validators.required]),
    });
  }

  get signUpControl() {
    return this.signUpForm.controls;
  }

  selectRole(role: { roleId: string; roleName: string }) {
    this.selectedRoleName = role.roleName;
    this.signUpForm.patchValue({ userType: role.roleId });
    console.log(this.signUpForm.value);
  }

  registerUser() {
    const registerData: registerRequest = this.signUpForm.value;
    console.log(registerData);

    this.loading = true; // Set loading state
    this.authService
      .register(registerData)
      .pipe(
        tap((response) => {
          this.signUpForm.reset();
        }),
        catchError((error) => {
          this.errorMessage = 'Registration failed. Please try again.'; // Handle error
          console.error('Registration error:', error);
          return of(null); // Return a default value to continue the stream
        }),
        finalize(() => {
          this.loadAllUser();
          this.loading = false; // Reset loading state
          this.signUpForm.reset();
          this.selectedRoleName = '';
          this.modalService.dismissAll();
        })
      )
      .subscribe();
  }

  getRoles() {
    this.loading = true; // Set loading state
    this.authService
      .getAllRoles()
      .pipe(
        tap((response) => {
          console.log(response);
          this.allRoles = response.filter(
            (role) => role.roleId !== '34af8a6f-d7d4-45a3-b6ea-201dfe13d3e0'
          ); //role.roleId !== "bdc6804c-3669-4463-92e2-876d06bb3fd2" &&
          console.log(this.allRoles);
          //  this.signUpForm.reset();
        }),
        catchError((error) => {
          this.errorMessage = 'Registration failed. Please try again.'; // Handle error
          console.error('Registration error:', error);
          return of(null); // Return a default value to continue the stream
        }),
        finalize(() => {
          this.loading = false; // Reset loading state
          //  this.modalService.dismissAll();
        })
      )
      .subscribe();
  }

  enforceLowerCase(event: Event) {
    const input = event.target as HTMLInputElement; // Get the input element
    const currentValue = input.value.toLowerCase(); // Get the current value of the input

    // Convert the entire input value to lowercase
    const newValue = currentValue.toLowerCase();

    // Update the input value with the lowercase version
    input.value = newValue.toLowerCase();

    // Emit the new value to the form control (if using reactive forms)
    this.signUpControl['email'].setValue(newValue, { emitEvent: false });
  }

  handleAction(event: { action: string; row: any }) {
    switch (event.action) {
      case 'edit':
        this.onEdit(event.row);
        break;
      case 'delete':
        this.deleteTest(event.row);
        break;
      case 'details':
        this.onDetails(event.row);
        break;

      default:
        console.error('Unknown action:', event.action);
    }
  }

  onEdit(val: any) {}

  deleteTest(val: any) {
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

        this.loading = true; // Set loading state to true while fetching data
        this.authService
          .deleteUserByuserId(val.userId)
          .pipe(
            tap((response: any) => {
              Swal.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success',
                confirmButtonColor: '#1a1f35',
              });
            }),
            catchError((error) => {
              console.error('Error:', error);
              return of(error); // Return an observable to handle the error
            }),
            finalize(() => {
              this.loading = false; // Stop loading
              this.loadAllUser();
            })
          )
          .subscribe();
      }
    });
  }

  onDetails(val: any) {
    console.log(val);
    this.router.navigateByUrl(`/dash/user-permissions/${val.userId}`);
    //
  }

  loadAllUser() {
    this.loading = true; // Start loading

    this.authService
      .getAllUsers()
      .pipe(
        tap((response: any) => {
          this.tableData = response.data; // Assign the fetched data to the list
          this.showColumns = this.generateTableHeaders(
            response.data.map(({ id, userId, roleId, ...rest }: any) => rest)
          );
          this.tableHeaders = this.generateTableHeaders(response.data);
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

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { scrollable: true, ariaLabelledBy: 'create-user' })
      .result.then(
        (result) => {
          // this.closeResult.set(`Closed with: ${result}`);
        },
        (reason) => {
          // this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`);
        }
      );
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

      // // Add 'currency' pipe for 'fee' column
      // if (key === 'fee') {
      //   pipe = 'currency';  // The pipe name for fee is currency
      //   pipeFormat = 'INR';  // No special formatting for 'currency' pipe
      // }
      // // Add 'date' pipe for 'startDate' column
      // else if (key === 'startDate') {
      //   pipe = 'date';  // The pipe name for startDate is date
      //   pipeFormat = 'd MMM, y';  // Custom format for date (can be changed as needed)
      // }

      return {
        key: key,
        displayName: formatDisplayName(key),
        pipe: pipe,
        pipeFormat: pipeFormat,
      };
    });
  }
}
