import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
        const headers = new HttpHeaders().set('Content-Type', 'application/json');

        return this.http.post<any>(`http://localhost:3000/admin/login`, { email: username, password }, { headers })
            .pipe(
                catchError(this.handleError),
                map(data => {
                    localStorage.setItem('currentToken', data.token);
                    this.currentToken = data.token;
                    this.currentTokenSubject.next(data.token);
                    return data;
                }
            ));
    }

    logout() {
        this.http.post(`http://localhost:3000/admin/logout`, null).subscribe();
        localStorage.removeItem('currentToken');
        this.currentTokenSubject.next(null);
    }

    handleError(error) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            if (error.status === 401) {
                errorMessage = 'Email or password is incorrect';
            } else if (error.status === 422) {
                errorMessage = 'Invalid email format';
            } else {
                errorMessage = `Error Code: ${error.status} - Message: ${error.message}`;
            }
        }
        return throwError(errorMessage);
    }
    
}