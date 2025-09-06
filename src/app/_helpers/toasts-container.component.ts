import { Component, TemplateRef, inject } from '@angular/core';
import { ToastService } from './toast.service';
import { NgTemplateOutlet } from '@angular/common';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';

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
export class ToastsContainerComponent {
  toastService = inject(ToastService);

  isTemplate(toast: { textOrTpl: any; }) { return toast.textOrTpl instanceof TemplateRef; }
}
