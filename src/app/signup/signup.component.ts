import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../auth/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConsoleLogger } from '../_helpers/console-logger';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    standalone: false
})
export class SignupComponent implements OnInit, OnDestroy {
    private readonly formBuilder = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    private readonly unsubscribe = new Subject<void>();

    loginForm: FormGroup;
    loading = false;
    returnUrl: string;
    apiVersion: string;
    error = '';
    recaptcha_token: string;
    status = '';

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }

        this.loginForm = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            captcha: ['', environment.recaptchaPublicKey ? Validators.required : '']
        });

        this.returnUrl = '/dashboard';
        this.isAlive();
    }

    getRecaptchaPublicKey(): string {
        return environment.recaptchaPublicKey;
    }

    get f() { return this.loginForm.controls; }

    onSubmit() {
        if (this.loginForm.invalid)
            return;
        
        this.status = '';
        this.loading = true;
        this.authService.signup({
                name: this.f.name.value,
                email: this.f.email.value,
                password: this.f.password.value,
                token: this.recaptcha_token || ''
            }).pipe(takeUntil(this.unsubscribe))
            .subscribe({
                next: () => {
                    this.router.navigate(['/login']);
                },
                error: error => {
                    ConsoleLogger.printError(error);
                    this.error = error;
                    this.loading = false;
                }
            });
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

    onKey() {
        this.error = '';
    }

    resolved(captchaResponse: string) {
        this.recaptcha_token = captchaResponse;
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

    private isAlive(): void {
        this.authService.isAlive().pipe(takeUntil(this.unsubscribe))
            .subscribe({
                next: data => {
                    if (data) {
                        this.apiVersion = data.attributes.version;
                    }
                },
                error: error => {
                    ConsoleLogger.printError(error);
                    this.status = 'Offline for Maintenance';
                }
            });
    }
}
