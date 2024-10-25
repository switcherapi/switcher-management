import { ValidatorFn } from '@angular/forms';

// Allow only values like 1s, 1m, 1h
const regex = new RegExp(/^\d+[smh]$/);
// Allow slash, alphanumeric, hyphen, underscore, dot only
const regexPath = new RegExp(/^[a-zA-Z0-9/_\-.]+$/);

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

export function pathValidator(): ValidatorFn {
  return control => {
    const value = control.value as string;
    
    if (value.length > 0) {
      if (value.startsWith('/') || value.endsWith('/') || value.includes('//')) {
        return { invalidPath: true };
      }

      if (!regexPath.test(value)) {
        return { invalidPath: true };
      }
    }
  };
}