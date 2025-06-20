import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { DomainService } from 'src/app/services/domain.service';

@Component({
  selector: 'signup-domain',
  templateUrl: './signup-domain.component.html',
  styleUrls: ['./signup-domain.component.css'],
  standalone: false
})
export class SignupDomainComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly domainService = inject(DomainService);
  private readonly toastService = inject(ToastService);

  private readonly unsubscribe = new Subject<void>();

  loading = false;
  error = '';
  request: string;
  domain: string;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.request = params['request'];
      this.domain = decodeURI(params['domain']);
    });
  }

  onAccept() {
    this.loading = true;
    this.domainService.acceptDomainTransfer(this.request).pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: success => {
          if (success) {
            this.router.navigate(['/dashboard']);
            this.toastService.showSuccess(`Domain transfered with success`);
          }
          this.loading = false;
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error = `Domain cannot be transfered`;
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
}
