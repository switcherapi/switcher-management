import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, Optional, PLATFORM_ID } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { filter } from "rxjs/operators";

import { loader } from "./load-script";
import {
  RECAPTCHA_LOADER_OPTIONS,
  RecaptchaLoaderOptions,
} from "./tokens";

function toNonNullObservable<T>(subject: BehaviorSubject<T | null>): Observable<T> {
  return subject.asObservable().pipe(filter<T>((value) => value !== null));
}

@Injectable()
export class RecaptchaLoaderService {
  /**
   * @internal
   * @nocollapse
   */
  private static ready: BehaviorSubject<ReCaptchaV2.ReCaptcha | null> | null = null;

  public ready: Observable<ReCaptchaV2.ReCaptcha>;

  /** @internal */
  private language?: string;
  /** @internal */
  private baseUrl?: string;
  /** @internal */
  private nonce?: string;
  /** @internal */
  private v3SiteKey?: string;
  /** @internal */
  private options?: RecaptchaLoaderOptions;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Optional() @Inject(RECAPTCHA_LOADER_OPTIONS) options?: RecaptchaLoaderOptions,
  ) {
    this.options = options;
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
