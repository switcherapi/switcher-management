import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentTokenSubject: BehaviorSubject<String>;
    public currentToken: Observable<String>;

    constructor(private http: HttpClient) {
        this.currentTokenSubject = new BehaviorSubject<String>(localStorage.getItem('currentToken'));
        this.currentToken = this.currentTokenSubject.asObservable();
    }

    public get currentTokenValue(): String {
        return this.currentTokenSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`http://localhost:8080/authenticate`, { username, password })
            .pipe(
                catchError(this.handleError),
                map(token => {
                localStorage.setItem('currentToken', token.token);
                this.currentToken = token.token;
                this.currentTokenSubject.next(token.token);
                return token.token;
            }));
    }

    logout() {
        localStorage.removeItem('currentToken');
        this.currentTokenSubject.next(null);
    }

    handleError(error) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            if (error.error.status === 401) {
                errorMessage = 'Username or password is incorrect';
            } else {
                errorMessage = `Error Code: ${error.status} - Message: ${error.message}`;
            }
        }
        return throwError(errorMessage);
    }
    
}