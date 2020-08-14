import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ConsoleLogger } from '../_helpers/console-logger';
import { AuthService } from '../auth/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login-reset',
  templateUrl: './login-reset.component.html',
  styleUrls: ['./login-reset.component.css']
})
export class LoginResetComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  loginForm: FormGroup;

  loading = false;
  error = '';
  code: string;
  recaptcha_token: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      password: ['', Validators.required],
      captcha: ['', Validators.required]
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

    this.authService.resetPassword(this.code, this.f.password.value, this.recaptcha_token)
      .pipe(takeUntil(this.unsubscribe)).subscribe(success => {
        if (success) {
          this.router.navigateByUrl('/dashboard');
          this.authService.releaseOldSessions.emit(true);
        }
        this.loading = false;
      }, error => {
        ConsoleLogger.printError(error);
        this.error = 'Invalid password format';
        this.loading = false;
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onKey(event: any) {
    this.error = '';
  }

  getRecaptchaPublicKey(): string {
    return environment.recaptchaPublicKey;
  }

  get f() { return this.loginForm.controls; }

  resolved(captchaResponse: string) {
    this.recaptcha_token = captchaResponse;
  }

}
