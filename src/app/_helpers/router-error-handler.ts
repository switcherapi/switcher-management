import { Router } from '@angular/router';

import { AuthService } from '../auth/services/auth.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RouterErrorHandler {

    constructor(
        private readonly router: Router,
        private readonly authService: AuthService
      ) { }

    doError(error: any): string {
        if (error.status === 401) {
            if (error.error && error.error.code === 401) {
                return '';
            }
            this.authService.cleanLocal();
            this.router.navigate(['/login']);
        }
        
        return error.error || 'Something went wrong';
    }
}