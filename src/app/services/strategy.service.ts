import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Strategy } from '../model/strategy';
import { ApiService } from './api.service';
import { StrategyReq } from '../model/strategy_req';
import { History } from '../model/history';

@Injectable({
  providedIn: 'root'
})
export class StrategyService extends ApiService {
  private readonly http = inject(HttpClient);
  
  constructor() {
    super();
  }

  public getStrategiesByConfig(id: string, enviroment: string): Observable<Strategy[]> {
    return this.http.get<Strategy[]>(`${environment.apiUrl}/configstrategy`, { params: { config: id, env: enviroment || 'default' } }).pipe(catchError(super.handleError));
  }

  public getStrategiesAvailable(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/configstrategy/spec/strategies/`).pipe(catchError(super.handleError));
  }

  public getStrategiesRequirements(strategy: string): Observable<StrategyReq> {
    return this.http.get<StrategyReq>(`${environment.apiUrl}/configstrategy/req/${strategy}`).pipe(catchError(super.handleError));
  }

  public getAvailableOperations(strategy: Strategy, requirements: StrategyReq): string[] {
    const operations = [];

    requirements.operationRequirements.forEach(opReq => {
      if (opReq.max >= strategy.values.length) {
        operations.push(opReq.operation);
      } 
    })

    return operations;
  }

  public validateStrategy(operation: string, values: string[], requirements: StrategyReq): boolean {
    const operationReq = requirements.operationRequirements.filter(op => op.operation === operation)[0];

    if (values.length > operationReq.max || values.length < operationReq.min)
      return false;
    else
      return true;
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

  public addValue(id: string, newValue: string): Observable<Strategy> {
    const body = {
      value: newValue
    }
    return this.http.patch<Strategy>((`${environment.apiUrl}/configstrategy/addval/` + id), body).pipe(catchError(super.handleError));
  }

  public updateValue(id: string, oldvalue: string, newvalue: string): Observable<Strategy> {
    const body = {
      oldvalue,
      newvalue
    }
    return this.http.patch<Strategy>((`${environment.apiUrl}/configstrategy/updateval/` + id), body).pipe(catchError(super.handleError));
  }

  public deleteValue(id: string, value: string): Observable<Strategy> {
    const body = {
      value
    }
    return this.http.patch<Strategy>((`${environment.apiUrl}/configstrategy/removeval/` + id), body).pipe(catchError(super.handleError));
  }

  public createStrategy(config: string, description: string, strategy: string, operation: string, env: string, values: string[]): Observable<Strategy> {
    const body = {
      description,
      strategy,
      values,
      operation,
      config,
      env
    }
    return this.http.post<Strategy>((`${environment.apiUrl}/configstrategy/create`), body).pipe(catchError(super.handleError));
  }

  public deleteStrategy(id: string): Observable<Strategy> {
    return this.http.delete<Strategy>(`${environment.apiUrl}/configstrategy/${id}`).pipe(catchError(super.handleError));
  }

  public getHistory(id: string, limit: number, skip: number): Observable<History[]> {
    return this.http.get<History[]>(`${environment.apiUrl}/configstrategy/history/${id}`, 
      { 
        params: {
          sortBy: 'date:desc',
          limit,
          skip
      }
    }).pipe(catchError(super.handleError));
  }

  public resetHistory(id: string): Observable<Strategy> {
    return this.http.delete<Strategy>(`${environment.apiUrl}/configstrategy/history/${id}`).pipe(catchError(super.handleError));
  }
  
}
