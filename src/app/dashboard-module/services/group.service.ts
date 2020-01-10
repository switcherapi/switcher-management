import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Domain } from 'src/app/dashboard-module/domain-module/model/domain';
import { Observable } from 'rxjs';
import { Group } from '../domain-module/model/group';
import { Config } from '../domain-module/model/config';
import { catchError } from 'rxjs/operators';
import { Strategy } from '../domain-module/model/strategy';
import { Team } from '../domain-module/model/team';
import { ApiService } from './api-service';

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

}
