import { Injectable } from '@angular/core';
import { HttpResponse, HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { AuthenticationService } from '../_services';
import { User } from '../_models/user';

// Mock
const users: User[] = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }];

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentToken = this.authenticationService.currentTokenValue;
        if (currentToken) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `Basic ${currentToken}`
                }
            });
        }

        const { url, method, headers, body } = request;

        return of(null).pipe(mergeMap(handleRoute));

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                default:
                    return next.handle(request);
            }    
        }

        function getUsers() {
            if (!isLoggedIn()) return unauthorized();
            return ok(users);
        }

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorized' } });
        }

        function isLoggedIn() {
            return headers.get('Authorization') === `Basic ${localStorage.getItem('currentToken')}`;
        }

    }
}