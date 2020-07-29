import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Domain } from 'src/app/dashboard-module/domain-module/model/domain';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { History } from '../domain-module/model/history';

@Injectable({
  providedIn: 'root'
})
export class DomainService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public getDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${environment.apiUrl}/domain`).pipe(catchError(super.handleError));
  }

  public getDomain(id: string): Observable<Domain> {
    return this.http.get<Domain>(`${environment.apiUrl}/domain/${id}`).pipe(catchError(super.handleError));
  }

  public setDomainEnvironmentStatus(id: string, env: string, status: boolean): Observable<Domain> {
    const body = {
      [`${env}`]: status
    }
    return this.http.patch<Domain>((`${environment.apiUrl}/domain/updateStatus/${id}`), body).pipe(catchError(super.handleError));
  }

  public removeDomainEnvironmentStatus(id: string,  env: string): Observable<Domain> {
    const body = {
      env
    }
    return this.http.patch<Domain>((`${environment.apiUrl}/domain/removeStatus/${id}`), body).pipe(catchError(super.handleError));
  }

  public updateDomain(id: string, description: string): Observable<Domain> {
    const body = {
      description
    }
    return this.http.patch<Domain>((`${environment.apiUrl}/domain/${id}`), body).pipe(catchError(super.handleError));
  }

  public createDomain(name: string, description: string): Observable<Domain> {
    const body = {
      name,
      description
    }
    return this.http.post<Domain>((`${environment.apiUrl}/domain/create`), body).pipe(catchError(super.handleError));
  }

  public deleteDomain(id: string): Observable<Domain> {
    return this.http.delete<Domain>(`${environment.apiUrl}/domain/${id}`).pipe(catchError(super.handleError));
  }

  public getHistory(id: string): Observable<History[]> {
    return this.http.get<History[]>(`${environment.apiUrl}/domain/history/${id}`, 
      { 
        params: {
          sortBy: 'date:desc'
      }
    }).pipe(catchError(super.handleError));
  }

  public resetHistory(id: string): Observable<Domain> {
    return this.http.delete<Domain>(`${environment.apiUrl}/domain/history/${id}`).pipe(catchError(super.handleError));
  }

}
