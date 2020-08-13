import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../auth/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
    private unsubscribe: Subject<void> = new Subject();

    loginForm: FormGroup;
    loading = false;
    waitingConfirmation = false;
    returnUrl: string;
    error = '';
    recaptcha_token: string;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }
    }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', Validators.required],
            captcha: ['', Validators.required]
        });

        this.returnUrl = '/dashboard';
    }

    getRecaptchaPublicKey(): string {
        return environment.recaptchaPublicKey;
    }

    get f() { return this.loginForm.controls; }

    onSubmit() {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;

        this.authService.signup({
            name: this.f.name.value,
            email: this.f.email.value,
            password: this.f.password.value,
            token: this.recaptcha_token
        }).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            if (data) {
                this.waitingConfirmation = true;
            }
            this.loading = false;
        }, error => {
            this.error = error;
            this.loading = false;
        }
        );
    }

    onGitHubLogin() {
        this.loading = true;
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${environment.githubApiClientId}`;
    }

    onBitBucketLogin() {
        this.loading = true;
        window.location.href = `https://bitbucket.org/site/oauth2/authorize?client_id=${environment.bitbucketApiClientId}&response_type=code`;
    }

    ngOnDestroy() {
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    onKey(event: any) {
        this.error = '';
    }

    resolved(captchaResponse: string) {
        this.recaptcha_token = captchaResponse;
    }
}
