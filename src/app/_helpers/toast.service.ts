import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts: any[] = [];

    show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
        this.toasts.push({ textOrTpl, ...options });
    }

    showSucess(textOrTpl: string | TemplateRef<any>) {
        this.show(textOrTpl, { classname: 'bg-success text-light', delay: 2000 });
    }

    showError(textOrTpl: string | TemplateRef<any>) {
        this.show(textOrTpl, { classname: 'bg-danger text-light', delay: 8000 });
    }

    remove(toast) {
        this.toasts = this.toasts.filter(t => t !== toast);
    }
}