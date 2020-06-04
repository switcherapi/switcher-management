import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Config } from '../domain-module/model/config';
import { catchError } from 'rxjs/operators';
import { Strategy } from '../domain-module/model/strategy';
import { ApiService } from './api.service';
import { History } from '../domain-module/model/history';

@Injectable({
  providedIn: 'root'
})
export class ConfigService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public getConfigsByGroup(id: string): Observable<Config[]> {
    return this.http.get<Config[]>(`${environment.apiUrl}/config`, { params: { group: id } }).pipe(catchError(super.handleError));
  }

  public getConfigById(id: string, resolveComponents: boolean): Observable<Config> {
    const resolve = resolveComponents ? 'true' : 'false';
    return this.http.get<Config>(`${environment.apiUrl}/config/${id}`, { params: { resolveComponents: resolve } }).pipe(catchError(super.handleError));
  }

  public getStrategiesByConfig(id: string): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(`${environment.apiUrl}/configstrategy`, { params: { config: id } }).pipe(catchError(super.handleError));
  }

  public setConfigEnvironmentStatus(id: string, env: string, status: boolean): Observable<Config> {
    const body = {
      [`${env}`]: status
    }
    return this.http.patch<Config>(`${environment.apiUrl}/config/updateStatus/${id}`, body).pipe(catchError(super.handleError));
  }

  public removeDomainEnvironmentStatus(id: string,  env: string): Observable<Config> {
    const body = {
      env
    }
    return this.http.patch<Config>((`${environment.apiUrl}/config/removeStatus/${id}`), body).pipe(catchError(super.handleError));
  }

  public updateConfig(id: string, key?: string, description?: string): Observable<Config> {
    const body: any = {}

    if (key) body.key = key;
    if (description) body.description = description;
    
    return this.http.patch<Config>(`${environment.apiUrl}/config/${id}`, body).pipe(catchError(super.handleError));
  }

  public updateConfigComponents(id: string, componentsId: string[]): Observable<Config> {
    const body = {
      components: componentsId
    }
    return this.http.patch<Config>(`${environment.apiUrl}/config/updateComponents/${id}`, body).pipe(catchError(super.handleError));
  }

  public createConfig(group: string, key: string, description: string): Observable<Config> {
    const body = {
      key,
      description,
      group
    }
    return this.http.post<Config>((`${environment.apiUrl}/config/create`), body).pipe(catchError(super.handleError));
  }

  public deleteConfig(id: string): Observable<Config> {
    return this.http.delete<Config>(`${environment.apiUrl}/config/${id}`).pipe(catchError(super.handleError));
  }

  public getHistory(id: string): Observable<History[]> {
    return this.http.get<History[]>(`${environment.apiUrl}/config/history/${id}`, 
      { 
        params: {
          sortBy: 'date:desc'
      }
    }).pipe(catchError(super.handleError));
  }

  public resetHistory(id: string): Observable<Config> {
    return this.http.delete<Config>(`${environment.apiUrl}/config/history/${id}`).pipe(catchError(super.handleError));
  }
  
}
