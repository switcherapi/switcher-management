import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from './../../../environments/environment';
import { Tokens } from '../models/tokens';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  @Output() logoff = new EventEmitter<string>();
  @Output() releaseOldSessions = new EventEmitter<any>();

  public static readonly USER_INFO = 'USER_INFO';
  public static readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  private currentTokenSubject: BehaviorSubject<string>;
  public currentToken: Observable<string>;

  public userInfoSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  loggedUser: string;

  constructor(private http: HttpClient) {
    this.currentTokenSubject = new BehaviorSubject<string>(localStorage.getItem(AuthService.JWT_TOKEN));
    this.currentToken = this.currentTokenSubject.asObservable();

    this.userInfoSubject = new BehaviorSubject<any>(localStorage.getItem(AuthService.USER_INFO));
    this.currentUser = this.userInfoSubject.asObservable();
  }

  login(user: { email: string, password: string }): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/login`, user)
      .pipe(
        tap(auth => {
          this.doLoginUser(auth.admin, auth.jwt);
          this.currentTokenSubject.next(auth.jwt.token);
        }),
        map(() => true),
        catchError(this.handleError));
  }

  loginWithGitHub(code: string): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/github/auth`, null, { params: { code } })
      .pipe(
        tap(auth => {
          this.doLoginUser(auth.admin, auth.jwt);
          this.currentTokenSubject.next(auth.jwt.token);
        }),
        map(() => true),
        catchError(this.handleError));
  }

  loginWithBitBucket(code: string): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/bitbucket/auth`, null, { params: { code } })
      .pipe(
        tap(auth => {
          this.doLoginUser(auth.admin, auth.jwt);
          this.currentTokenSubject.next(auth.jwt.token);
        }),
        map(() => true),
        catchError(this.handleError));
  }

  signup(user: { name: string, email: string, password: string, token: string }): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/signup`, user)
      .pipe(
        tap(signup => signup != undefined),
        map(() => true),
        catchError(this.handleError));
  }

  authorize(code: string): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/signup/authorization`, null, { params: { code } })
      .pipe(
        tap(auth => {
          this.doLoginUser(auth.admin, auth.jwt);
          this.currentTokenSubject.next(auth.jwt.token);
        }));
  }

  resetPassword(code: string, password: string, token: string): Observable<boolean> {
    const body = { code, password, token };
    return this.http.post<any>(`${environment.apiUrl}/admin/login/recovery`, body)
      .pipe(
        tap(auth => {
          this.doLoginUser(auth.admin, auth.jwt);
          this.currentTokenSubject.next(auth.jwt.token);
        }));
  }

  cleanLocal() {
    this.currentTokenSubject.next(null);
    this.doLogoutUser();
  }

  logout(deleted = false) {
    if (!deleted) {
      this.http.post<any>(`${environment.apiUrl}/admin/logout`, null).subscribe();
    }
    this.currentTokenSubject.next(null);
    this.doLogoutUser();
  }

  isLoggedIn() {
    return !!this.getJwtToken();
  }

  refreshToken() {
    return this.http.post<any>(`${environment.apiUrl}/admin/refresh/me`, {
      'refreshToken': this.getRefreshToken()
    }).pipe(
      tap({
        next: (tokens: Tokens) => this.storeJwtToken(tokens),
        error: () => this.cleanLocal()
      })
    );
  }

  isAlive(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/check`, { params: { details: 1 } }).pipe(catchError(this.handleError));
  }

  getJwtToken() {
    return localStorage.getItem(AuthService.JWT_TOKEN);
  }

  setUserInfo(key: string, value: string, propagate = false): void {
    let userData = {};

    if (localStorage.getItem(AuthService.USER_INFO)) {
      userData = JSON.parse(localStorage.getItem(AuthService.USER_INFO));
      userData[`${key}`] = value;
    } else {
      userData[`${key}`] = value;
    }
      
    localStorage.setItem(AuthService.USER_INFO, JSON.stringify(userData));

    if (propagate) {
      this.userInfoSubject.next(userData);
    }
  }

  getUserInfo(key: string): string {
    if (localStorage.getItem(AuthService.USER_INFO)) {
      return JSON.parse(localStorage.getItem(AuthService.USER_INFO))[`${key}`];
    }
  }

  private handleError(result: any) {
    let errorMessage = '';
    if (result.error instanceof ErrorEvent) {
      errorMessage = `Error: ${result.error.message}`;
    } else if (result.status === 401 || result.status === 422) {
      errorMessage = 'Invalid email/password';
    } else if (result.status === 400) {
      errorMessage = result.error.error;
    } else {
      ConsoleLogger.printError(result);
      errorMessage = `Switcher API is offline`;
    }
    
    return throwError(() => errorMessage);
  }

  private doLoginUser(user: any, tokens: Tokens) {
    const loggegWith = this.getLoggedWith(user);
    
    this.setUserInfo('name', user.name);
    this.setUserInfo('email', user.email);
    this.setUserInfo('sessionid', user.id);
    this.setUserInfo('avatar', user._avatar);
    this.setUserInfo('platform', loggegWith, true);
    
    this.loggedUser = user.email;
    this.storeTokens(tokens);
  }

  private doLogoutUser() {
    this.loggedUser = null;
    this.removeTokens();
  }

  private getLoggedWith(user: any): string {
    if (user._gitid) return 'GitHub';
    if (user._bitbucketid) return 'Bitbucket';
    return 'Switcher API';
  }

  private getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeJwtToken(tokens: Tokens) {
    localStorage.setItem(AuthService.JWT_TOKEN, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  private storeTokens(tokens: Tokens) {
    localStorage.setItem(AuthService.JWT_TOKEN, tokens.token);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refreshToken);
  }

  private removeTokens() {
    localStorage.clear();
  }
}
