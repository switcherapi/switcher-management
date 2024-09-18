import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ConsoleLogger } from '../_helpers/console-logger';
import { AuthService } from '../auth/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup-auth',
  templateUrl: './signup-auth.component.html',
  styleUrls: ['./signup-auth.component.css']
})
export class SignupAuthComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject<void>();

  codeConfirmationForm: FormGroup;

  loading = false;
  error = '';
  code: string;
  team: string;
  domain: string;
  status = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.isAlive();
    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
    
      if (this.code) {
        this.onConfirm(this.code);
      } else {
        this.codeConfirmationForm = this.formBuilder.group({
          code: ['', Validators.required]
        });
      }
    });
  }

  onConfirm(code: string) {
    this.loading = true;

    this.authService.authorize(code).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/dashboard']);
            this.authService.releaseOldSessions.emit(true);
          }
          this.loading = false;
        },
        error: (error) => {
          ConsoleLogger.printError(error);
          this.error = 'Invalid code';
          this.loading = false;
        }
      });
  }

  onSubmit() {
    if (this.codeConfirmationForm.invalid) {
        return;
    }

    this.onConfirm(this.f.code.value);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onKey(_event: any) {
    this.error = '';
  }

  get f() { return this.codeConfirmationForm.controls; }

  private isAlive(): void {
    this.authService.isAlive().pipe(takeUntil(this.unsubscribe))
      .subscribe({
        error: (_error) => {
          ConsoleLogger.printError(_error);
          this.status = 'Offline for Maintenance';
        }
      });
}

}
