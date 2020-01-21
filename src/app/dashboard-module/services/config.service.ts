import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Config } from '../domain-module/model/config';
import { catchError } from 'rxjs/operators';
import { Strategy } from '../domain-module/model/strategy';
import { ApiService } from './api-service';

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

  public getStrategiesByConfig(id: string): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(`${environment.apiUrl}/configstrategy`, { params: { config: id } }).pipe(catchError(super.handleError));
  }

  public setConfigEnvironmentStatus(id: string, env: string, status: boolean): Observable<Config> {
    const body = {
      [`${env}`]: status
    }
    return this.http.patch<Config>((`${environment.apiUrl}/config/updateStatus/` + id), body).pipe(catchError(super.handleError));
  }
  
}
