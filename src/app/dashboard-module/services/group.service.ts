import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Group } from '../domain-module/model/group';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }
  
  public getGroupsByDomain(id: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${environment.apiUrl}/groupconfig`, { params: { domain: id } }).pipe(catchError(super.handleError));
  }

  public setGroupEnvironmentStatus(id: string, env: string, status: boolean): Observable<Group> {
    const body = {
      [`${env}`]: status
    }
    return this.http.patch<Group>((`${environment.apiUrl}/groupconfig/updateStatus/` + id), body).pipe(catchError(super.handleError));
  }

  public updateGroup(id: string, name: string, description: string): Observable<Group> {
    const body = {
      name,
      description
    }
    return this.http.patch<Group>((`${environment.apiUrl}/groupconfig/` + id), body).pipe(catchError(super.handleError));
  }

  public createGroup(domain: string, name: string, description: string): Observable<Group> {
    const body = {
      name,
      description,
      domain
    }
    return this.http.post<Group>((`${environment.apiUrl}/groupconfig/create`), body).pipe(catchError(super.handleError));
  }

  public deleteGroup(id: string): Observable<Group> {
    return this.http.delete<Group>(`${environment.apiUrl}/groupconfig/${id}`).pipe(catchError(super.handleError));
  }
}
