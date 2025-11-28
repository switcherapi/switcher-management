import { Injectable, TemplateRef, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private readonly _toasts = signal<any[]>([]);
    
    // Expose toasts as a getter to maintain compatibility
    get toasts() {
        return this._toasts();
    }

    show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
        const currentToasts = this._toasts();
        this._toasts.set([...currentToasts, { textOrTpl, ...options }]);
    }

    showSuccess(textOrTpl: string | TemplateRef<any>) {
        this.show(textOrTpl, { classname: 'bg-success text-light', delay: 2000 });
    }

    showError(textOrTpl: string | TemplateRef<any>) {
        this.show(textOrTpl, { classname: 'bg-danger text-light', delay: 8000 });
    }

    remove(toast: any) {
        const currentToasts = this._toasts();
        this._toasts.set(currentToasts.filter(t => t !== toast));
    }
}