import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Domain } from 'src/app/dashboard/domain/model/domain';
import { Observable, throwError } from 'rxjs';
import { Group } from '../domain/model/group';
import { Config } from '../domain/model/config';
import { catchError } from 'rxjs/operators';
import { Strategy } from '../domain/model/strategy';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  public getDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${environment.apiUrl}/domain`).pipe(catchError(this.handleError));
  }

  public getDomain(id: string): Observable<Domain> {
    return this.http.get<Domain>(`${environment.apiUrl}/domain/` + id).pipe(catchError(this.handleError));
  }
  
  public getGroupsByDomain(id: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${environment.apiUrl}/groupconfig`, { params: { domain: id } }).pipe(catchError(this.handleError));
  }

  public getConfigsByGroup(id: string): Observable<Config[]> {
    return this.http.get<Config[]>(`${environment.apiUrl}/config`, { params: { group: id } }).pipe(catchError(this.handleError));
  }

  public getStrategiesByConfig(id: string): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(`${environment.apiUrl}/configstrategy`, { params: { config: id } }).pipe(catchError(this.handleError));
  }

  handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
        if (error.status === 401) {
          return throwError(error);
        } else if (error.status === 422) {
          errorMessage = 'Invalid arguments';
        } else if (error.status === 0) {
          errorMessage = 'Switcher API is offline';
        } else {
          errorMessage = `Error Code: ${error.status} - Message: ${error.message}`;
        }
    }
    return throwError(errorMessage);
  }

}
