import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, mapTo, tap } from 'rxjs/operators';
import { environment } from './../../../environments/environment';
import { Tokens } from '../models/tokens';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  @Output() logoff: EventEmitter<String> = new EventEmitter();
  @Output() releaseOldSessions: EventEmitter<any> = new EventEmitter();

  public static readonly USER_INFO = 'USER_INFO';
  public static readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  private currentTokenSubject: BehaviorSubject<String>;
  public currentToken: Observable<String>;

  private userInfoSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  loggedUser: string;

  constructor(private http: HttpClient) {
    this.currentTokenSubject = new BehaviorSubject<String>(localStorage.getItem(AuthService.JWT_TOKEN));
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

  loginWithBitBucket(code: string): Observable<boolean> {
    return this.http.post<any>(`${environment.apiUrl}/admin/bitbucket/auth`, null, { params: { code } })
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
        tap(signup => signup != undefined),
        mapTo(true),
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

  cleanSession() {
    this.currentTokenSubject.next(null);
    this.doLogoutUser();
  }

  logout(deleted: boolean = false) {
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
    }).pipe(tap((tokens: Tokens) => {
      this.storeJwtToken(tokens);
    }));
  }

  isAlive(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/check`).pipe(catchError(this.handleError));
  }

  getJwtToken() {
    return localStorage.getItem(AuthService.JWT_TOKEN);
  }

  setUserInfo(key: string, value: string): void {
    if (localStorage.getItem(AuthService.USER_INFO)) {
      const userData = JSON.parse(localStorage.getItem(AuthService.USER_INFO));
      userData[`${key}`] = value;
      localStorage.setItem(AuthService.USER_INFO, JSON.stringify(userData));
      this.userInfoSubject.next(userData);
    }
  }

  getUserInfo(key: string): string {
    if (localStorage.getItem(AuthService.USER_INFO)) {
      return JSON.parse(localStorage.getItem(AuthService.USER_INFO))[`${key}`];
    }
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
      } else if (error.status === 400) {
        errorMessage = 'Invalid account input or account already exists';
      } else {
        ConsoleLogger.printError(error);
        errorMessage = `Switcher API is offline`;
      }
    }
    return throwError(errorMessage);
  }

  private doLoginUser(user: any, tokens: Tokens) {
    const loggegWith = user._gitid ? 'GitHub' : user._bitbucketid ? 'BitBucket' : 'Switcher API';
    const userData = JSON.stringify({ 
      name: user.name,
      email: loggegWith === 'Switcher API' ? user.email : `Logged @${loggegWith}`,
      sessionid: user.id,
      avatar: user._avatar,
      platform: loggegWith
    });

    localStorage.setItem(AuthService.USER_INFO, userData);
    this.userInfoSubject.next(userData);
    this.loggedUser = user.email;
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
