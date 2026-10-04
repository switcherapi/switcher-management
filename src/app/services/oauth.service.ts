import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthorizedApp } from '../model/authorized-app';

interface OAuthAuthorizeResponse {
  redirect_uri: string;
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService extends ApiService {
  private readonly http = inject(HttpClient);

  constructor() {
    super();
  }

  public getAuthorizedApps(): Observable<AuthorizedApp[]> {
    return this.http.get<AuthorizedApp[]>(`${environment.apiUrl}/oauth/authorized`)
      .pipe(catchError(error => this.handleOAuthError(error)));
  }

  public revokeApp(clientId: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/oauth/authorized/${encodeURIComponent(clientId)}`)
      .pipe(catchError(error => this.handleOAuthError(error)));
  }

  /**
   * Submit the consent decision to the API's /oauth/authorize endpoint using an
   * authenticated request (the TokenInterceptor attaches the admin's session JWT).
   *
   * A plain top-level browser navigation can't carry that Authorization header, so
   * this asks the API for a JSON `{ redirect_uri }` instead of its default 302
   * response - the caller is responsible for performing the final top-level
   * navigation to that redirect_uri (the client's loopback callback).
   */
  public authorize(params: Record<string, string>, consent: boolean): Observable<OAuthAuthorizeResponse> {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        query.set(key, value);
      }
    });

    query.set('consent', String(consent));

    return this.http.get<OAuthAuthorizeResponse>(`${environment.apiUrl}/oauth/authorize?${query.toString()}`, {
      headers: { Accept: 'application/json' }
    }).pipe(catchError(error => this.handleOAuthError(error)));
  }

  private handleOAuthError(error: any) {
    if (error?.status === 404) {
      return throwError(() => error);
    }

    return super.handleError(error);
  }
}

