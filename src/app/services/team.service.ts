import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Team } from '../model/team';
import { ApiService } from './api.service';
import { TeamInvite } from '../model/team-invite';
import { Admin } from '../model/admin';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends ApiService {
  private readonly http = inject(HttpClient);
  
  constructor() {
    super();
  }

  public getTeamsByDomain(id: string): Observable<Team[]> {
    return this.http.get<Team[]>(`${environment.apiUrl}/team`, { params: { domain: id } }).pipe(catchError(super.handleError));
  }

  public getTeam(id: string): Observable<Team> {
    return this.http.get<Team>(`${environment.apiUrl}/team/${id}`, { params: { resolveMembers: 'true' } }).pipe(catchError(super.handleError));
  }

  public createTeam(domainId: string, name: string): Observable<Team> {
    const body = {
      name,
      domain: domainId
    };

    return this.http.post<Team>(`${environment.apiUrl}/team/create`, body).pipe(catchError(super.handleError));
  }

  public updateTeam(id: string, name: string, active: string): Observable<Team> {
    const body = {
      name,
      active
    };

    return this.http.patch<Team>(`${environment.apiUrl}/team/${id}`, body).pipe(catchError(super.handleError));
  }

  public inviteTeamMember(id: string, email: string): Observable<TeamInvite> {
    const body = {
      email
    };

    return this.http.post<TeamInvite>(`${environment.apiUrl}/team/member/invite/${id}`, body).pipe(catchError(super.handleError));
  }

  public getInvitation(request: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/team/member/invite/${request}`).pipe(catchError(super.handleError));
  }

  public getPendingInvitations(teamid: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/team/member/invite/pending/${teamid}`).pipe(catchError(super.handleError));
  }

  public acceptInvitation(request: string): Observable<Admin> {
    return this.http.post<Admin>(`${environment.apiUrl}/team/member/invite/accept/${request}`, null).pipe(catchError(super.handleError));
  }

  public removeInvitation(teamid: string, request: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/team/member/invite/remove/${teamid}/${request}`).pipe(catchError(super.handleError));
  }

  public removeTeamMember(id: string, member: string): Observable<Team> {
    const body = {
      member
    };

    return this.http.patch<Team>(`${environment.apiUrl}/team/member/remove/${id}`, body).pipe(catchError(super.handleError));
  }

  public removeTeamPermission(id: string, permission: string): Observable<Team> {
    const body = {
      permission
    };

    return this.http.patch<Team>(`${environment.apiUrl}/team/permission/remove/${id}`, body).pipe(catchError(super.handleError));
  }

  public deleteTeam(id: string): Observable<Team> {
    return this.http.delete<Team>(`${environment.apiUrl}/team/${id}`).pipe(catchError(super.handleError));
  }

}
