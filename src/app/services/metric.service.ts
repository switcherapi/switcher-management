import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Metric, MetricStatistics, MetricStatisticsRequest } from '../model/metric';

@Injectable({
  providedIn: 'root'
})
export class MetricService extends ApiService {
  private readonly http = inject(HttpClient);

  constructor() {
    super();
  }

  public getMetrics(domainId: string, env: string, page: number, key?: string, 
      dateGroupPattern?: string, dateBefore?: string, dateAfter?: string): Observable<Metric> {
    const params: any = {};

    params.environment = env;
    params.domainid = domainId;
    params.page = page;
    if (key) { params.key = key; }
    if (dateGroupPattern) { params.dateGroupPattern = dateGroupPattern; }
    if (dateBefore) { params.dateBefore = dateBefore; }
    if (dateAfter) { params.dateAfter = dateAfter; }

    params.sortBy = '-date';
    
    return this.http.get<Metric>(`${environment.apiUrl}/metric/data`, { params }).pipe(catchError(super.handleError));
  }

  public getMetricStatistics(metricStatisticsRequest: MetricStatisticsRequest): Observable<MetricStatistics> {
    const params: any = {};
    const { domainId, env, statistics, key, type, dateGroupPattern, dateBefore, dateAfter } = metricStatisticsRequest;

    params.environment = env;
    params.domainid = domainId;
    params.statistics = statistics;
    if (key) { 
      if (type === 'Switcher') {
        params.key = key;
      } else {
        params.group = key;
      }
    }
    if (dateGroupPattern) { params.dateGroupPattern = dateGroupPattern; }
    if (dateBefore) { params.dateBefore = dateBefore; }
    if (dateAfter) { params.dateAfter = dateAfter; }

    return this.http.get<MetricStatistics>(`${environment.apiUrl}/metric/statistics`, { params }).pipe(catchError(super.handleError));
  }

  public resetMetricsForSwitcher(domainid: string, switcher: string): Observable<any> {
    const params: any = {};
    params.domainid = domainid;
    params.key = switcher;

    return this.http.delete<any>(`${environment.apiUrl}/metric`, { params }).pipe(catchError(super.handleError));
  }

}
