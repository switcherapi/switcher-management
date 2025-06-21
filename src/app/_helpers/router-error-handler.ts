import { Router } from '@angular/router';

import { AuthService } from '../auth/services/auth.service';
import { Injectable, inject } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RouterErrorHandler {
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    doError(error: any): string {
        if (error.status === 401) {
            if (error.error && error.error.code === 401) {
                return '';
            }
            this.authService.cleanLocal();
            this.router.navigate(['/login']);
        }
        
        return error.error ?? 'Something went wrong';
    }
}