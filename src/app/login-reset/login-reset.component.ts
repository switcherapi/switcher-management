import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConsoleLogger } from '../_helpers/console-logger';
import { AuthService } from '../auth/services/auth.service';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { ReCaptchaV3Service } from '../../libs/ng-recaptcha-module/lib/recaptcha-v3.service';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-login-reset',
    templateUrl: './login-reset.component.html',
    styleUrls: ['./login-reset.component.css'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton]
})
export class LoginResetComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly recaptchaV3Service = inject(ReCaptchaV3Service);
  private readonly destroyRef = inject(DestroyRef);

  readonly loginForm: FormGroup;

  readonly loading = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly code = signal<string>('');
  readonly recaptchaToken = signal<string>('');

  readonly f = computed(() => this.loginForm.controls);

  constructor() {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required]
    });

    this.handleRouteParams();
  }

  private handleRouteParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.code.set(params['code'] || '');
    
      if (!this.code()) {
        this.router.navigate(['/']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
        return;
    }

    this.loading.set(true);

    if (!environment.recaptchaPublicKey) {
      this.submitPasswordReset();
      return;
    }

    this.recaptchaV3Service.execute('password_reset')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (token) => {
          this.recaptchaToken.set(token);
          this.submitPasswordReset();
        },
        error: (error) => {
          ConsoleLogger.printError('reCAPTCHA error:', error);
          this.error.set('reCAPTCHA verification failed. Please try again.');
          this.loading.set(false);
        }
      });
  }

  onKey(_event: any): void {
    this.error.set('');
  }

  getRecaptchaPublicKey(): string {
    return environment.recaptchaPublicKey;
  }

  private submitPasswordReset(): void {
    const formControls = this.f();
    this.authService.resetPassword(this.code(), formControls.password.value, this.recaptchaToken())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: success => {
          if (success) {
            this.router.navigateByUrl('/dashboard');
            this.authService.releaseOldSessions.emit(true);
          }
          this.loading.set(false);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error.set('Invalid password format');
          this.loading.set(false);
        }
      });
  }

}
