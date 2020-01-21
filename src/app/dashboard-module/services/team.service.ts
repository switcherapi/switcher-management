import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Team } from '../domain-module/model/team';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public getTeamsByDomain(id: string): Observable<Team[]> {
    return this.http.get<Team[]>(`${environment.apiUrl}/team`, { params: { domain: id } }).pipe(catchError(super.handleError));
  }

}
