import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SwitcherComponent } from '../domain-module/model/switcher-component';
import { Metric } from '../domain-module/model/metric';

@Injectable({
  providedIn: 'root'
})
export class MetricService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public getMetrics(domainId: string, env: string, key?: string, dateGroupPattern?: string, dateBefore?: string, dateAfter?: string): Observable<Metric> {
    let params: any = {}

    params.environment = env;
    if (key) { params.key = key; }
    if (dateGroupPattern) { params.dateGroupPattern = dateGroupPattern; }
    if (dateBefore) { params.dateBefore = dateBefore; }
    if (dateAfter) { params.dateAfter = dateAfter; }

    return this.http.get<Metric>(`${environment.apiUrl}/metric/${domainId}`, { params }).pipe(catchError(super.handleError));
  }

  public resetMetricsForSwitcher(switcherId: string): Observable<SwitcherComponent> {
    return this.http.delete<SwitcherComponent>(`${environment.apiUrl}/metric/${switcherId}`).pipe(catchError(super.handleError));
  }

}
