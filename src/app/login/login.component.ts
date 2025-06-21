import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../auth/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConsoleLogger } from '../_helpers/console-logger';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent implements OnInit, OnDestroy {
    private readonly formBuilder = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    private readonly unsubscribe = new Subject<void>();

    loginForm: FormGroup;
    loading = false;
    apiVersion: string;
    error = '';
    success = '';
    status = '';

    ngOnInit() {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }

        this.route.queryParams.subscribe(params => {
            const platform =  params['platform'];
            const code =  params['code'];
            
            if (code) {
                if (platform === 'github') {
                    this.loginWithGitHub(code);
                } else if (platform === 'bitbucket') {
                    this.loginWithBitBucket(code);
                } else {
                    this.router.navigate(['/']);
                }
            }
        });

        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
        
        this.isAlive();
    }

    get f() { return this.loginForm.controls; }

    onSubmit() {
        if (this.loginForm.invalid)
            return;

        this.status = '';
        this.loading = true;
        this.authService.login({
                email: this.f.email.value,
                password: this.f.password.value
            })
            .pipe(takeUntil(this.unsubscribe))
            .subscribe({
                next: success => this.onSuccess(success),
                error: error => this.onError(error)
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

    onKey(_event: any) {
        this.error = '';
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

    private loginWithGitHub(code: string) {
        this.loading = true;

        this.authService.loginWithGitHub(code)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe({
                next: success => this.onSuccess(success),
                error: error => this.onError(error)
            });
    }

    private loginWithBitBucket(code: string) {
        this.loading = true;

        this.authService.loginWithBitBucket(code)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe({
                next: success => this.onSuccess(success),
                error: error => this.onError(error)
            });
    }

    private onError(error: any) {
        ConsoleLogger.printError(error);
        this.error = error;
        this.loading = false;
    }

    private onSuccess(success: any) {
        if (success) {
            this.router.navigate(['/dashboard']);
            this.authService.releaseOldSessions.emit(true);
        }
        this.loading = false;
    }
}
