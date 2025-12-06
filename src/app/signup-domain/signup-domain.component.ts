import { Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { DomainService } from 'src/app/services/domain.service';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-signup-domain',
    templateUrl: './signup-domain.component.html',
    styleUrls: ['./signup-domain.component.css'],
    imports: [MatFormField, MatLabel, MatInput, MatButton]
})
export class SignupDomainComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly domainService = inject(DomainService);
  private readonly toastService = inject(ToastService);

  private readonly queryParams = toSignal(this.route.queryParams, { initialValue: {} });
  readonly loading = signal(false);
  readonly error = signal('');
  
  readonly request = computed(() => this.queryParams()?.['request'] || '');
  readonly domain = computed(() => this.queryParams()?.['domain'] ? decodeURI(this.queryParams()['domain']) : '');

  onAccept() {
    this.loading.set(true);
    this.error.set('');
    
    this.domainService.acceptDomainTransfer(this.request()).subscribe({
      next: success => {
        if (success) {
          this.router.navigate(['/dashboard']);
          this.toastService.showSuccess(`Domain transfered with success`);
        }
        this.loading.set(false);
      },
      error: error => {
        ConsoleLogger.printError(error);
        this.error.set(`Domain cannot be transfered`);
        this.loading.set(false);
      }
    });
  }

  onKey(_event: any) {
    this.error.set('');
  }
}
