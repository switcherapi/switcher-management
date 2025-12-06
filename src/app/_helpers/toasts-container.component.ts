import { Component, TemplateRef, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ToastService } from './toast.service';
import { NgTemplateOutlet } from '@angular/common';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-toasts',
    template: `
    @for (toast of toastService.toasts; track toast) {
      <ngb-toast
        [class]="toast.classname"
        [autohide]="true"
        [delay]="toast.delay || 3000"
        (hidden)="toastService.remove(toast)"
      >
        @if (isTemplate(toast)) {
          <ng-template [ngTemplateOutlet]="toast.textOrTpl"></ng-template>
        } @else {
          {{ toast.textOrTpl }}
        }
      </ngb-toast>
    }
  `,
    host: {
        'class': 'toast-container position-fixed bottom-0 start-50 translate-middle-x',
        'style': 'z-index: 1200; margin-bottom: .5rem;'
    },
    imports: [NgbToast, NgTemplateOutlet]
})
export class ToastsContainerComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef, { optional: true });
  private readonly unsubscribe = new Subject<void>();
  private intervalId: any;
  
  toastService = inject(ToastService);

  ngOnInit() {
    // Monitor toasts array for changes and trigger change detection
    // This ensures UI updates when toasts are added/removed in zoneless mode
    if (this.cdr) {
      this.intervalId = setInterval(() => {
        this.cdr.detectChanges();
      }, 50); // Check every 50ms for toast changes
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  isTemplate(toast: { textOrTpl: any; }) { return toast.textOrTpl instanceof TemplateRef; }
}
