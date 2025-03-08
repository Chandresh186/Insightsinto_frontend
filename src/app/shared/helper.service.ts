import { Injectable } from "@angular/core";
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { BehaviorSubject } from "rxjs";

export function patternValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*[@$!%*?&]).{8,}$/;
      const valid = regex.test(control.value);
      return valid ? null : { invalidPassword: true };
    };
  }





export function passwordPatternValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const password = formGroup.get('password')?.value;

    const validations = {
      minLengthCheck: password.length >= 8,
      numericCharCheck: /\d/.test(password),
      uppercaseCharCheck: /[A-Z]/.test(password),
      specialCharCheck: /[!@#$%^&*]/.test(password)
    };

    const errors = Object.entries(validations)
      .filter(([_, isValid]) => !isValid)
      .reduce((acc, [key]) => ({ ...acc, [key]: true }), {});

    // Return errors if any condition fails; otherwise, null
    return Object.keys(errors).length ? errors : null;
  };
}


@Injectable({
  providedIn: 'root' // makes the service available globally
})

export class SharedDataService {
  private dataSource = new BehaviorSubject<any>(null); // initial value is null
  currentData = this.dataSource.asObservable(); // Observable to allow subscription

  constructor() {}

  // Method to update the data
  changeData(data: any) {
    this.dataSource.next(data);
  }
}
