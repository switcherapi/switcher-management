import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Role } from '../model/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public getRolesByTeam(id: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.apiUrl}/role`, { params: { team: id } }).pipe(catchError(super.handleError));
  }

  public getRoleRouters(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/role/routers`).pipe(catchError(super.handleError));
  }

  public getRoleActions(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/role/actions`).pipe(catchError(super.handleError));
  }

  public getKeysByRouter(router: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/role/spec/router/${router}`).pipe(catchError(super.handleError));
  }

  public createRole(idTeam: string, action: string, router: string, identifiedBy?: string, values?: string[]): Observable<Role> {
    let body = {};

    if (identifiedBy) {
      body = { action, router, identifiedBy, values };
    } else {
      body = { action, router };
    }

    return this.http.post<Role>(`${environment.apiUrl}/role/create/${idTeam}`, body).pipe(catchError(super.handleError));
  }

  public updateRole(id: string, action: string, router: string, identifiedBy?: string, active: boolean = true): Observable<Role> {
    let body = { action, router, identifiedBy, active: active ? 'true' : 'false' };

    return this.http.patch<Role>(`${environment.apiUrl}/role/${id}`, body).pipe(catchError(super.handleError));
  }

  public updateRoleValues(id: string, values: string[]): Observable<Role> {
    let body = {
      values
    };

    return this.http.patch<Role>(`${environment.apiUrl}/role/updateValues/${id}`, body).pipe(catchError(super.handleError));
  }

  public deleteRole(id: string): Observable<Role> {
    return this.http.delete<Role>(`${environment.apiUrl}/role/${id}`).pipe(catchError(super.handleError));
  }

}
