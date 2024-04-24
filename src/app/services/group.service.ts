import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Group } from '../model/group';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { History } from '../model/history';

@Injectable({
  providedIn: 'root'
})
export class GroupService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }
  
  public getGroupsByDomain(id: string, skip: number, fields?: string): Observable<Group[]> {
    const params: any = {
      domain: id,
      skip: skip.toString(),
    };

    if (fields) {
      params.fields = fields;
    }

    return this.http.get<Group[]>(`${environment.apiUrl}/groupconfig`, { params })
      .pipe(catchError(super.handleError));
  }

  public getGroupById(id: string): Observable<Group> {
    return this.http.get<Group>(`${environment.apiUrl}/groupconfig/${id}`)
      .pipe(catchError(super.handleError));
  }

  public setGroupEnvironmentStatus(id: string, env: string, status: boolean): Observable<Group> {
    const body = {
      [`${env}`]: status
    }
    return this.http.patch<Group>((`${environment.apiUrl}/groupconfig/updateStatus/` + id), body)
      .pipe(catchError(super.handleError));
  }

  public removeDomainEnvironmentStatus(id: string,  env: string): Observable<Group> {
    const body = {
      env
    }
    return this.http.patch<Group>((`${environment.apiUrl}/groupconfig/removeStatus/${id}`), body)
      .pipe(catchError(super.handleError));
  }

  public updateGroup(id: string, name?: string, description?: string): Observable<Group> {
    const body: any = {}

    if (name) body.name = name;
    if (description) body.description = description;

    return this.http.patch<Group>((`${environment.apiUrl}/groupconfig/` + id), body)
      .pipe(catchError(super.handleError));
  }

  public createGroup(domain: string, name: string, description: string): Observable<Group> {
    const body = {
      name,
      description,
      domain
    }
    return this.http.post<Group>((`${environment.apiUrl}/groupconfig/create`), body)
      .pipe(catchError(super.handleError));
  }

  public deleteGroup(id: string): Observable<Group> {
    return this.http.delete<Group>(`${environment.apiUrl}/groupconfig/${id}`)
      .pipe(catchError(super.handleError));
  }

  public getHistory(id: string, limit: number, skip: number): Observable<History[]> {
    return this.http.get<History[]>(`${environment.apiUrl}/groupconfig/history/${id}`, 
      { 
        params: {
          sortBy: 'date:desc',
          limit,
          skip
      }
    }).pipe(catchError(super.handleError));
  }

  public resetHistory(id: string): Observable<Group> {
    return this.http.delete<Group>(`${environment.apiUrl}/groupconfig/history/${id}`)
      .pipe(catchError(super.handleError));
  }
}
