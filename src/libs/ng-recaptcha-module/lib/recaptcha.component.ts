/// <reference types="grecaptcha" />

import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Input, NgZone, OnDestroy, Output, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { RecaptchaLoaderService } from './recaptcha-loader.service';
import { RecaptchaSettings } from './recaptcha-settings';
import { RECAPTCHA_SETTINGS } from './tokens';

let nextId = 0;

export type NeverUndefined<T> = T extends undefined ? never : T;

export type RecaptchaErrorParameters = Parameters<NeverUndefined<ReCaptchaV2.Parameters['error-callback']>>;

@Component({
    exportAs: 'reCaptcha',
    selector: 'app-re-captcha',
    template: ''
})
export class RecaptchaComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly loader = inject(RecaptchaLoaderService);
  private readonly zone = inject(NgZone);

  @Input()
  @HostBinding('attr.id')
  public id = `ngrecaptcha-${nextId++}`;

  @Input() public siteKey?: string;
  @Input() public theme?: ReCaptchaV2.Theme;
  @Input() public type?: ReCaptchaV2.Type;
  @Input() public size?: ReCaptchaV2.Size;
  @Input() public tabIndex?: number;
  @Input() public badge?: ReCaptchaV2.Badge;
  @Input() public errorMode: 'handled' | 'default' = 'default';

  @Output() public resolved = new EventEmitter<string | null>();
  /**
   * @deprecated `(error) output will be removed in the next major version. Use (errored) instead
   */
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() public error = new EventEmitter<RecaptchaErrorParameters>();
  @Output() public errored = new EventEmitter<RecaptchaErrorParameters>();

  /** @internal */
  private subscription: Subscription;
  /** @internal */
  private widget: number;
  /** @internal */
  private grecaptcha: ReCaptchaV2.ReCaptcha;
  /** @internal */
  private executeRequested: boolean;

  constructor() {
    const settings = inject<RecaptchaSettings>(RECAPTCHA_SETTINGS, { optional: true });

    if (settings) {
      this.siteKey = settings.siteKey;
      this.theme = settings.theme;
      this.type = settings.type;
      this.size = settings.size;
      this.badge = settings.badge;
    }
  }

  public ngAfterViewInit(): void {
    this.subscription = this.loader.ready.subscribe((grecaptcha: ReCaptchaV2.ReCaptcha) => {
      if (grecaptcha != null && grecaptcha.render instanceof Function) {
        this.grecaptcha = grecaptcha;
        this.renderRecaptcha();
      }
    });
  }

  public ngOnDestroy(): void {
    // reset the captcha to ensure it does not leave anything behind
    // after the component is no longer needed
    this.grecaptchaReset();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Executes the invisible recaptcha.
   * Does nothing if component's size is not set to "invisible".
   */
  public execute(): void {
    if (this.size !== 'invisible') {
      return;
    }

    if (this.widget == null) {
      // delay execution of recaptcha until it actually renders
      this.executeRequested = true;
    } else {
      void this.grecaptcha.execute(this.widget);
    }
  }

  public reset(): void {
    if (this.widget != null) {
      if (this.grecaptcha.getResponse(this.widget)) {
        // Only emit an event in case if something would actually change.
        // That way we do not trigger "touching" of the control if someone does a "reset"
        // on a non-resolved captcha.
        this.resolved.emit(null);
      }

      this.grecaptchaReset();
    }
  }

  /** @internal */
  private expired() {
    this.resolved.emit(null);
  }

  /** @internal */
  private onError(args: RecaptchaErrorParameters) {
    this.errored.emit(args);
  }

  /** @internal */
  private captchaResponseCallback(response: string) {
    this.resolved.emit(response);
  }

  /** @internal */
  private grecaptchaReset() {
    if (this.widget != null) {
      this.zone.runOutsideAngular(() => this.grecaptcha.reset(this.widget));
    }
  }

  /** @internal */
  private renderRecaptcha() {
    // This `any` can be removed after @types/grecaptcha get updated
    const renderOptions: ReCaptchaV2.Parameters = {
      badge: this.badge,
      callback: (response: string) => {
        this.zone.run(() => this.captchaResponseCallback(response));
      },
      'expired-callback': () => {
        this.zone.run(() => this.expired());
      },
      sitekey: this.siteKey,
      size: this.size,
      tabindex: this.tabIndex,
      theme: this.theme,
      type: this.type,
    };

    if (this.errorMode === 'handled') {
      renderOptions['error-callback'] = (...args: RecaptchaErrorParameters) => {
        this.zone.run(() => this.onError(args));
      };
    }

    this.widget = this.grecaptcha.render(this.elementRef.nativeElement, renderOptions);

    if (this.executeRequested === true) {
      this.executeRequested = false;
      this.execute();
    }
  }
}
