import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { ConsoleLogger } from '../_helpers/console-logger';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { ReCaptchaV3Service } from '../../libs/ng-recaptcha-module/lib/recaptcha-v3.service';
import { MatButton } from '@angular/material/button';
import { AppVersionComponent } from '../app-version/app-version.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput,
    MatButton, AppVersionComponent
  ]
})
export class SignupComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly recaptchaV3Service = inject(ReCaptchaV3Service);
  private readonly destroyRef = inject(DestroyRef);

  readonly loginForm: FormGroup;
  readonly loading = signal<boolean>(false);
  readonly returnUrl = '/dashboard';
  readonly apiVersion = signal<string>('');
  readonly error = signal<string>('');
  readonly recaptchaToken = signal<string>('');
  readonly status = signal<string>('');

  readonly f = computed(() => this.loginForm.controls);

  constructor() {
    this.loginForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.checkAuthAndRedirect();
    this.isAlive();
  }

  private checkAuthAndRedirect(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  getRecaptchaPublicKey(): string {
    return environment.recaptchaPublicKey;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.status.set('');
    this.loading.set(true);

    if (!environment.recaptchaPublicKey) {
      this.submitForm();
      return;
    }

    this.recaptchaV3Service.execute('signup')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (token) => {
          this.recaptchaToken.set(token);
          this.submitForm();
        },
        error: (error) => {
          ConsoleLogger.printError('reCAPTCHA error:', error);
          this.error.set('reCAPTCHA verification failed. Please try again.');
          this.loading.set(false);
        }
      });
  }

  onGitHubLogin(): void {
    this.loading.set(true);
    globalThis.location.href = `https://github.com/login/oauth/authorize?client_id=${environment.githubApiClientId}`;
  }

  onBitbucketLogin(): void {
    this.loading.set(true);
    globalThis.location.href = `https://bitbucket.org/site/oauth2/authorize?client_id=${environment.bitbucketApiClientId}&response_type=code`;
  }

  onSamlLogin(): void {
    this.loading.set(true);
    globalThis.location.href = `${environment.apiUrl}/admin/saml/login`;
  }

  onKey(): void {
    this.error.set('');
  }

  hasGithubIntegration(): boolean {
    return environment.githubApiClientId != undefined;
  }

  hasBitbucketIntegration(): boolean {
    return environment.bitbucketApiClientId != undefined;
  }

  hasInternalAuthEnabled(): boolean {
    return environment.allowInternalAuth;
  }

  hasSamlAuthEnabled(): boolean {
    return environment.allowSamlAuth;
  }

  private submitForm(): void {
    const formControls = this.f();
    this.authService.signup({
      name: formControls.name.value,
      email: formControls.email.value,
      password: formControls.password.value,
      token: this.recaptchaToken() || ''
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error.set(error);
          this.loading.set(false);
        }
      });
  }

  private isAlive(): void {
    this.authService.isAlive().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.apiVersion.set(data?.attributes.version || '');
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.status.set('Offline for Maintenance');
        }
      });
  }
}
