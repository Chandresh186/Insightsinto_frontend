import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

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
