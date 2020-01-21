import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Strategy } from '../domain-module/model/strategy';
import { ApiService } from './api.service';
import { StrategyReq } from '../domain-module/model/strategy_req';

@Injectable({
  providedIn: 'root'
})
export class StrategyService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public getStrategiesByConfig(id: string): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(`${environment.apiUrl}/configstrategy`, { params: { config: id } }).pipe(catchError(super.handleError));
  }

  public getStrategiesRequirements(strategy: string): Observable<StrategyReq> {
    return this.http.get<StrategyReq>(`${environment.apiUrl}/configstrategy/req/${strategy}`).pipe(catchError(super.handleError));
  }

  public getAvailableOperations(strategy: Strategy, requirements: StrategyReq): string[] {
    let operations = [];

    requirements.operationRequirements.forEach(opReq => {
      if (opReq.max >= strategy.values.length) {
        operations.push(opReq.operation);
      } 
    })

    return operations;
  }

  public setStrategyEnvironmentStatus(id: string, env: string, status: boolean): Observable<Strategy> {
    const body = {
      [`${env}`]: status
    }
    return this.http.patch<Strategy>((`${environment.apiUrl}/configstrategy/updateStatus/` + id), body).pipe(catchError(super.handleError));
  }

  public updateStrategy(id: string, description: string, operation: string): Observable<Strategy> {
    const body = {
      description,
      operation
    }
    return this.http.patch<Strategy>((`${environment.apiUrl}/configstrategy/` + id), body).pipe(catchError(super.handleError));
  }
  
}
