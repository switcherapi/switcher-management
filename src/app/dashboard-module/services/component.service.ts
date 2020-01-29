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

}
