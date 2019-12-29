import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Domain } from 'src/app/dashboard/domain/model/domain';
import { Observable } from 'rxjs';
import { Group } from '../domain/model/group';
import { Config } from '../domain/model/config';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  public getDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${environment.apiUrl}/domain`).pipe();
  }

  public getDomain(id: string): Observable<Domain> {
    return this.http.get<Domain>(`${environment.apiUrl}/domain/` + id).pipe();
  }
  
  public getGroupsByDomain(id: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${environment.apiUrl}/groupconfig`, { params: { domain: id } }).pipe();
  }

  public getConfigsByGroup(id: string): Observable<Config[]> {
    return this.http.get<Config[]>(`${environment.apiUrl}/config`, { params: { group: id } }).pipe();
  }

}
