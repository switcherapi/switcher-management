import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Environment } from '../domain-module/model/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public getEnvironmentsByDomainId(id: string): Observable<Environment[]> {
    return this.http.get<Environment[]>(`${environment.apiUrl}/environment`, { params: { domain: id } }).pipe(catchError(super.handleError));
  }

}
