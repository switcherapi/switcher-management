import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { AuthenticationService } from '../_services';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentToken = this.authenticationService.currentTokenValue;
        if (currentToken) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${currentToken}`
                }
            });
        }

        const { url, method, headers, body } = request;

        return of(null).pipe(mergeMap(handleRoute));

        function handleRoute() {
            return next.handle(request);
        }
    }
}