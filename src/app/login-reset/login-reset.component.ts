import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
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
export class LoginResetComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly recaptchaV3Service = inject(ReCaptchaV3Service);

  private readonly unsubscribe = new Subject<void>();

  loginForm: FormGroup;

  loading = false;
  error = '';
  code: string;
  recaptcha_token: string;

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
    
      if (!this.code) {
        this.router.navigate(['/']);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
        return;
    }

    this.loading = true;

    this.recaptchaV3Service.execute('password_reset')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (token) => {
          this.recaptcha_token = token;
          this.submitPasswordReset();
        },
        error: (error) => {
          ConsoleLogger.printError('reCAPTCHA error:', error);
          this.error = 'reCAPTCHA verification failed. Please try again.';
          this.loading = false;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onKey(_event: any) {
    this.error = '';
  }

  getRecaptchaPublicKey(): string {
    return environment.recaptchaPublicKey;
  }

  get f() { return this.loginForm.controls; }

  private submitPasswordReset() {
    this.authService.resetPassword(this.code, this.f.password.value, this.recaptcha_token)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: success => {
          if (success) {
            this.router.navigateByUrl('/dashboard');
            this.authService.releaseOldSessions.emit(true);
          }
          this.loading = false;
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error = 'Invalid password format';
          this.loading = false;
        }
      });
  }

}
