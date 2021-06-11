import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { FEATURES, Slack, SlackInstallation } from '../model/slack';

@Injectable({
  providedIn: 'root'
})
export class SlackService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public findSlackInstallation(enterprise_id: string, team_id: string): Observable<SlackInstallation> {
    return this.http.get<SlackInstallation>(
      `${environment.apiUrl}/slack/v1/installation/find?enterprise_id=${enterprise_id}&team_id=${team_id}`)
      .pipe(catchError(super.handleError));
  }

  public getSlackInstallation(domainId: string): Observable<Slack> {
    return this.http.get<Slack>(`${environment.apiUrl}/slack/v1/installation/${domainId}`)
      .pipe(catchError(super.handleError));
  }

  public getSlackAvailability(feature: FEATURES): Observable<any> {
    return this.http.post(`${environment.apiUrl}/slack/v1/availability`, { feature })
      .pipe(catchError(this.handleError));
  }

  public authorizeInstallation(domain: string, team_id: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/slack/v1/authorize`, { domain, team_id })
      .pipe(catchError(this.handleError));
  }

  public resetTickets(team_id: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/slack/v1/ticket/clear`, { team_id })
      .pipe(catchError(this.handleError));
  }

  public unlinkInstallation(domainid: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/slack/v1/installation/unlink?domain=${domainid}`)
      .pipe(catchError(this.handleError));
  }

  public declineInstallation(enterprise_id: string, team_id: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/slack/v1/installation/decline?enterprise_id=${enterprise_id}&team_id=${team_id}`)
      .pipe(catchError(this.handleError));
  }

}
