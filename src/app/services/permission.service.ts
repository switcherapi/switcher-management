import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { GraphQLPermissionResultSet, Permission } from '../model/permission';
import { Apollo } from 'apollo-angular';
import { permissionQuery } from '../model/graphql-schemas';

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends ApiService {
  private readonly http = inject(HttpClient);
  private readonly apollo = inject(Apollo);

  constructor() {
    super();
  }

  public getPermissionsByTeam(id: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${environment.apiUrl}/permission`, { params: { team: id } }).pipe(catchError(super.handleError));
  }

  public getPermissionRouters(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/permission/routers`).pipe(catchError(super.handleError));
  }

  public getPermissionActions(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/permission/actions`).pipe(catchError(super.handleError));
  }

  public getKeysByRouter(router: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/permission/spec/router/${router}`).pipe(catchError(super.handleError));
  }

  public createPermission(idTeam: string, action: string, router: string, 
    environments: string[] = [], identifiedBy?: string, values?: string[]): Observable<Permission> {
    let body = {};

    if (identifiedBy) {
      body = { action, router, environments, identifiedBy, values };
    } else {
      body = { action, router, environments };
    }

    return this.http.post<Permission>(`${environment.apiUrl}/permission/create/${idTeam}`, body).pipe(catchError(super.handleError));
  }

  public updatePermission(id: string, action: string, router: string, identifiedBy?: string, 
    environments: string[] = [], values: string[] = [], active = true): Observable<Permission> {
    const body = { action, router, identifiedBy, environments, values, active: active ? 'true' : 'false' };

    return this.http.patch<Permission>(`${environment.apiUrl}/permission/${id}`, body).pipe(catchError(super.handleError));
  }

  public updatePermissionStatus(id: string, active = true): Observable<Permission> {
    const body = { active: active ? 'true' : 'false' };

    return this.http.patch<Permission>(`${environment.apiUrl}/permission/${id}`, body).pipe(catchError(super.handleError));
  }

  public deletePermission(id: string): Observable<Permission> {
    return this.http.delete<Permission>(`${environment.apiUrl}/permission/${id}`).pipe(catchError(super.handleError));
  }

  public executePermissionQuery(domainId: string, parentId: string, router: string, actions: string[], environment = 'default') {
    return this.apollo.query<GraphQLPermissionResultSet>({
      query: permissionQuery(),
      fetchPolicy: 'network-only',
      variables: { 
        domain: domainId,
        parent: parentId,
        router,
        actions,
        environment
      }
    });
  }

}
