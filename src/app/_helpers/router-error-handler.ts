import { Router } from '@angular/router';

import { AuthService } from '../auth/services/auth.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class RouterErrorHandler {

    constructor(
        private router: Router,
        private authService: AuthService
      ) { }

    doError(error: any): string {
        if (error.status === 401) {
            this.authService.cleanSession();
            this.router.navigate(['/login']);
        } else {
            return error;
        }
    }
}