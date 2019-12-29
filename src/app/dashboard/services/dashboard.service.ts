import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Domain } from 'src/app/dashboard/model/domain';
import { Observable } from 'rxjs';

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
  
}
