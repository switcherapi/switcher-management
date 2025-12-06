import { AbstractControl, ValidatorFn } from "@angular/forms";

export class DataUtils {

  public static pushValuesIfValid(arr: string[], value: string[], max: number): boolean {
    let success = true;
    value.forEach(v => {
      if (v.length <= max) {
        if (!arr.includes(v)) {
          arr.push(v);
        }
      } else {
        success = false;
      }
    });

    return success;
  }

  public static showResumed(value: string, length: number): string {
    return value.length > length ? `${value.substring(0, length)}...` : value;
  }

  public static valueInputValidator(format: string): ValidatorFn {
    return (control: AbstractControl): Record<string, any> | null => {
      if (!control.value.match(format)) {
        return [control.value]
      }
      return null;
    };
  }

  public static isArrDiff(oldArr: any[], newArr: any[]): boolean {
    return oldArr.join(',') !== newArr.join(',')
  }

}