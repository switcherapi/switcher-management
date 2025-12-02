import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { ConsoleLogger } from '../_helpers/console-logger';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { AppVersionComponent } from '../app-version/app-version.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, AppVersionComponent]
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loginForm: FormGroup;
  readonly loading = signal<boolean>(false);
  readonly apiVersion = signal<string | undefined>(undefined);
  readonly error = signal<string>('');
  readonly success = signal<string>('');
  readonly status = signal<string>('');

  readonly f = computed(() => this.loginForm.controls);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.checkAuthAndRedirect();
    this.loginWithSAMLToken();
    this.handleRouteParams();
    this.isAlive();
  }

  private checkAuthAndRedirect(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  private handleRouteParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const platform = params['platform'];
      const code = params['code'];

      if (code) {
        if (platform === 'github') {
          this.loginWithGitHub(code);
        } else if (platform === 'bitbucket') {
          this.loginWithBitbucket(code);
        } else {
          this.router.navigate(['/']);
        }
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.status.set('');
    this.loading.set(true);
    const formControls = this.f();
    this.authService.login({
      email: formControls.email.value,
      password: formControls.password.value
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: success => this.onSuccess(success),
        error: error => this.onError(error)
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

  onKey(_event: any): void {
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

  private isAlive(): void {
    this.authService.isAlive().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.apiVersion.set(data?.attributes.version);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.status.set('Offline for Maintenance');
        }
      });
  }

  private loginWithGitHub(code: string): void {
    this.loading.set(true);

    this.authService.loginWithGitHub(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: success => this.onSuccess(success),
        error: error => this.onError(error)
      });
  }

  private loginWithBitbucket(code: string): void {
    this.loading.set(true);

    this.authService.loginWithBitBucket(code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: success => this.onSuccess(success),
        error: error => this.onError(error)
      });
  }

  private loginWithSAMLToken(): void {
    if (globalThis.location.hash) {
      const hashParams = new URLSearchParams(globalThis.location.hash.substring(1));
      const token = hashParams.get('token');

      if (token) {
        this.loading.set(true);

        this.authService.loginWithSAMLToken(token)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: success => this.onSuccess(success),
            error: error => this.onError(error)
          });
      }
    }
  }

  private onError(error: any): void {
    ConsoleLogger.printError(error);
    this.error.set(error);
    this.loading.set(false);
  }

  private onSuccess(success: any): void {
    if (success) {
      this.router.navigate(['/dashboard']);
      this.authService.releaseOldSessions.emit(true);
    }
    this.loading.set(false);
  }
}
