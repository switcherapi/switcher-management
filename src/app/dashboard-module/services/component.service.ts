import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SwitcherComponent } from '../domain-module/model/switcher-component';

@Injectable({
  providedIn: 'root'
})
export class ComponentService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public getComponentsByDomain(id: string): Observable<SwitcherComponent[]> {
    return this.http.get<SwitcherComponent[]>(`${environment.apiUrl}/component`, { params: { domain: id } }).pipe(catchError(super.handleError));
  }

  public createComponent(domain: string, name: string, description: string): Observable<SwitcherComponent> {
    const body = {
      name,
      description,
      domain
    }
    return this.http.post<SwitcherComponent>(`${environment.apiUrl}/component/create`, body).pipe(catchError(super.handleError));
  }

  public deleteComponent(id: string): Observable<SwitcherComponent> {
    return this.http.delete<SwitcherComponent>(`${environment.apiUrl}/component/${id}`).pipe(catchError(super.handleError));
  }

  public updateComponent(id: string, name: string): Observable<SwitcherComponent> {
    const body = {
      name
    }
    return this.http.patch<SwitcherComponent>(`${environment.apiUrl}/component/${id}`, body).pipe(catchError(super.handleError));
  }

}
