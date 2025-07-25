import { Directive, forwardRef, HostListener, inject } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { RecaptchaComponent } from "./recaptcha.component";

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RecaptchaValueAccessorDirective),
    },
  ],
  selector: "re-captcha[formControlName],re-captcha[formControl],re-captcha[ngModel]",
  standalone: false
})
export class RecaptchaValueAccessorDirective implements ControlValueAccessor {
  private readonly host = inject(RecaptchaComponent);

  /** @internal */
  private onChange: (value: string | null) => void;

  /** @internal */
  private onTouched: () => void;

  private requiresControllerReset = false;

  public writeValue(value: string): void {
    if (!value) {
      this.host.reset();
    }
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
    if (this.requiresControllerReset) {
      this.requiresControllerReset = false;
      this.onChange(null);
    }
  }
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener("resolved", ["$event"]) public onResolve($event: string): void {
    if (this.onChange) {
      this.onChange($event);
    }
    if (this.onTouched) {
      this.onTouched();
    }
  }
}
