import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { filter } from "rxjs/operators";

import { loader } from "./load-script";
import {
  RECAPTCHA_LOADER_OPTIONS,
  RECAPTCHA_V3_SITE_KEY,
  RecaptchaLoaderOptions,
} from "./tokens";

function toNonNullObservable<T>(subject: BehaviorSubject<T | null>): Observable<T> {
  return subject.asObservable().pipe(filter<T>((value) => value !== null));
}

@Injectable()
export class RecaptchaLoaderService {
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * @internal
   * @nocollapse
   */
  private static ready: BehaviorSubject<ReCaptchaV2.ReCaptcha | null> | null = null;

  public ready: Observable<ReCaptchaV2.ReCaptcha>;

  /** @internal */
  private readonly language?: string;
  /** @internal */
  private readonly baseUrl?: string;
  /** @internal */
  private readonly nonce?: string;
  /** @internal */
  private readonly v3SiteKey?: string;
  /** @internal */
  private readonly options?: RecaptchaLoaderOptions;

  constructor() {
    const options = inject<RecaptchaLoaderOptions>(RECAPTCHA_LOADER_OPTIONS, { optional: true });
    const v3SiteKey = inject<string>(RECAPTCHA_V3_SITE_KEY, { optional: true });

    this.options = options;
    this.v3SiteKey = v3SiteKey;
    
    const subject = this.init();
    this.ready = subject ? toNonNullObservable(subject) : of();
  }

  /** @internal */
  private init(): BehaviorSubject<ReCaptchaV2.ReCaptcha | null> | undefined {
    if (RecaptchaLoaderService.ready) {
      return RecaptchaLoaderService.ready;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return undefined;
    }

    const subject = new BehaviorSubject<ReCaptchaV2.ReCaptcha | null>(null);
    RecaptchaLoaderService.ready = subject;

    loader.newLoadScript({
      v3SiteKey: this.v3SiteKey,
      onBeforeLoad: (url) => {
        if (this.options?.onBeforeLoad) {
          return this.options.onBeforeLoad(url);
        }

        const newUrl = new URL(this.baseUrl ?? url);

        if (this.language) {
          newUrl.searchParams.set("hl", this.language);
        }

        return {
          url: newUrl,
          nonce: this.nonce,
        };
      },
      onLoaded: (recaptcha) => {
        let value = recaptcha;
        if (this.options?.onLoaded) {
          value = this.options.onLoaded(recaptcha);
        }

        subject.next(value);
      },
    });

    return subject;
  }
}
