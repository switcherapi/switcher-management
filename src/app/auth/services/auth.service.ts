import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, mapTo, tap } from 'rxjs/operators';
import { environment } from './../../../environments/environment';
import { Tokens } from '../models/tokens';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  @Output() logoff: EventEmitter<String> = new EventEmitter();
  @Output() releaseOldSessions: EventEmitter<any> = new EventEmitter();

  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  private currentTokenSubject: BehaviorSubject<String>;
  public currentToken: Observable<String>;

  private loggedUser: string;

  constructor(private http: HttpClient) {
    this.currentTokenSubject = new BehaviorSubject<String>(localStorage.getItem(this.JWT_TOKEN));
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  login(user: { email: string, password: string }): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/login`, user)
      .pipe(
        tap(tokens => {
          this.doLoginUser(user.email, tokens.jwt);
          this.currentTokenSubject.next(tokens.jwt.token);
        }),
        mapTo(true),
        catchError(this.handleError));
  }

  cleanSession() {
    this.currentTokenSubject.next(null);
    this.doLogoutUser();
  }

  logout() {
    this.http.post<any>(`${environment.apiUrl}/admin/logout`, null).subscribe();
    this.currentTokenSubject.next(null);
    this.doLogoutUser();
  }

  isLoggedIn() {
    return !!this.getJwtToken();
  }

  refreshToken() {
    return this.http.post<any>(`${environment.apiUrl}/admin/refresh/me`, {
      'refreshToken': this.getRefreshToken()
    }).pipe(tap((tokens: Tokens) => {
      this.storeJwtToken(tokens);
    }));
  }

  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN);
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
            console.log(error);
            errorMessage = `Switcher API is offline`;
        }
    }
    return throwError(errorMessage);
  }

  private doLoginUser(username: string, tokens: Tokens) {
    this.loggedUser = username;
    this.storeTokens(tokens);
  }

  private doLogoutUser() {
    this.loggedUser = null;
    this.removeTokens();
  }

  private getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeJwtToken(tokens: Tokens) {
    localStorage.setItem(this.JWT_TOKEN, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  private storeTokens(tokens: Tokens) {
    localStorage.setItem(this.JWT_TOKEN, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  private removeTokens() {
    localStorage.clear();
  }
}
