import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../auth/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConsoleLogger } from '../_helpers/console-logger';
import { AdminService } from '../services/admin.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    private unsubscribe: Subject<void> = new Subject();

    loginForm: FormGroup;
    loading = false;
    forgotPassword = false;
    apiVersion: string;
    error: string = '';
    success: string = '';
    status: string = ''; 

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private adminService: AdminService
    ) {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }
    }

    ngOnInit() {
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
        if (this.loginForm.invalid || this.forgotPassword)
            return;

        this.status = '';
        this.loading = true;
        this.authService.login({
                email: this.f.email.value,
                password: this.f.password.value
            })
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(success => this.onSuccess(success), error => this.onError(error));
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

    onForgotPassword() {
        this.forgotPassword = true;
    }

    onSendResetPassord() {
        this.f.password.setValue(' ');
        if (this.loginForm.invalid) {
            this.error = 'Please, add a valid email';
        } else {
            this.loading = true;
            this.adminService.requestPasswordReset(this.f.email.value)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(data => {

                if (data) {
                    this.success = 'Password recovery successfully sent';
                }
                this.loading = false;
                
            }, error => this.onError(error));
        }
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
        this.authService.isAlive().pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            if (data) {
                this.apiVersion = data.attributes.version;
            }
        }, error => {
            ConsoleLogger.printError(error);
            this.status = 'Offline for Maintenance';
        });
    }

    private loginWithGitHub(code: string) {
        this.loading = true;

        this.authService.loginWithGitHub(code)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(success => this.onSuccess(success), error => this.onError(error));
    }

    private loginWithBitBucket(code: string) {
        this.loading = true;

        this.authService.loginWithBitBucket(code)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(success => this.onSuccess(success), error => this.onError(error));
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
