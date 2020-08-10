import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, mapTo, tap } from 'rxjs/operators';
import { environment } from './../../../environments/environment';
import { Tokens } from '../models/tokens';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { CookieService } from 'ngx-cookie-service';

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

  loggedUser: string;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.currentTokenSubject = new BehaviorSubject<String>(localStorage.getItem(this.JWT_TOKEN));
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  login(user: { email: string, password: string }): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/login`, user)
      .pipe(
        tap(auth => {
          this.doLoginUser(auth.admin, auth.jwt);
          this.currentTokenSubject.next(auth.jwt.token);
        }),
        mapTo(true),
        catchError(this.handleError));
  }

  loginWithGitHub(code: string): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/github/auth`, null, { params: { code } })
      .pipe(
        tap(auth => {
          this.doLoginUser(auth.admin, auth.jwt);
          this.currentTokenSubject.next(auth.jwt.token);
        }),
        mapTo(true),
        catchError(this.handleError));
  }

  signup(user: { name: string, email: string, password: string, token: string }): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/signup`, user)
      .pipe(
        tap(auth => {
          this.doLoginUser(auth.admin, auth.jwt);
          this.currentTokenSubject.next(auth.jwt.token);
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

  getCookie(key: string) {
    return this.cookieService.get(key);
  }

  setCookie(key: string, value: any) {
    return this.cookieService.set(key, value);
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
            ConsoleLogger.printError(error);
            errorMessage = `Switcher API is offline`;
        }
    }
    return throwError(errorMessage);
  }

  private doLoginUser(user: any, tokens: Tokens) {
    this.cookieService.set('switcherapi.user', user.name);
    this.cookieService.set('switcherapi.sessionid', user.id);
    this.cookieService.set('switcherapi.gitid', user._gitid);
    this.loggedUser = user.email;
    this.storeTokens(tokens);
  }

  private doLogoutUser() {
    this.cookieService.deleteAll('/');
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
