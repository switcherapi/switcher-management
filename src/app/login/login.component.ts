import { Component, OnInit, OnDestroy } from '@angular/core';
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
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    private unsubscribe: Subject<void> = new Subject();

    loginForm: FormGroup;
    loading = false;
    returnUrl: string;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
        }
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const githubcode =  params['code'];
            if (githubcode) {
                this.loginWithGitHub(githubcode);
            }
        });

        this.loginForm = this.formBuilder.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.returnUrl = '/dashboard';
        this.inviteLink();
    }

    private loginWithGitHub(code: string) {
        this.loading = true;

        this.authService.loginWithGitHub(code).pipe(takeUntil(this.unsubscribe)).subscribe(success => {
                if (success) {
                    this.router.navigateByUrl(this.returnUrl);
                    this.authService.releaseOldSessions.emit(true);
                }
                this.loading = false;
            }, error => {
                ConsoleLogger.printError(error);
                this.error = error;
                this.loading = false;
            });
    }

    private inviteLink() {
        const queryUrl: string = this.route.snapshot.queryParams['returnUrl'];
        if (queryUrl && queryUrl.includes('/collab/join?request')) {
            this.returnUrl = queryUrl;
        }
    }

    get f() { return this.loginForm.controls; }

    onSubmit() {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;

        this.authService.login({
                email: this.f.email.value,
                password: this.f.password.value
            }).pipe(takeUntil(this.unsubscribe)).subscribe(success => {
                if (success) {
                    this.router.navigateByUrl(this.returnUrl);
                    this.authService.releaseOldSessions.emit(true);
                }
                this.loading = false;
            }, error => {
                ConsoleLogger.printError(error);
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
}
