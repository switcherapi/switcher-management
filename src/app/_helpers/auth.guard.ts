import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../_services';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) { }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.authenticationService.keepAlive().toPromise().then((currentToken) => {
            if (currentToken) {
                return true;
            }
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
        });
    }
    
}