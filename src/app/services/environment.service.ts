import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Environment } from '../model/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService extends ApiService {
  private readonly http = inject(HttpClient);

  constructor() {
    super();
  }

  public getEnvironmentsByDomainId(id: string): Observable<Environment[]> {
    return this.http.get<Environment[]>(`${environment.apiUrl}/environment`, { params: { domain: id } }).pipe(catchError(super.handleError));
  }

  public createEnvironment(domain: string, name: string): Observable<Environment> {
    const body = {
      name,
      domain
    }
    return this.http.post<Environment>(`${environment.apiUrl}/environment/create`, body).pipe(catchError(super.handleError));
  }

  public deleteEnvironment(id: string): Observable<Environment> {
    return this.http.delete<Environment>(`${environment.apiUrl}/environment/${id}`).pipe(catchError(super.handleError));
  }

  public resetEnvironment(id: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/environment/recover/${id}`, null).pipe(catchError(super.handleError));
  }

}
