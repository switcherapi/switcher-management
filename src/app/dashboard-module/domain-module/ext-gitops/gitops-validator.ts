import { ValidatorFn } from '@angular/forms';

const regex = new RegExp(/^\d+[smh]$/);

/**
 * Allows only values
 * @returns 
 */
export function windowValidator(): ValidatorFn {
  return control => {
    const value = control.value as string;

    if (!regex.test(value)) {
      return { invalidWindow: true };
    }

    if (value.endsWith('s') && parseInt(value) < 30) {
      return { invalidWindow: true };
    }

    if (parseInt(value) < 1) {
      return { invalidWindow: true };
    }
  };
}