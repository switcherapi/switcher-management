import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { History } from '../model/history';
import { Domain } from '../model/domain';
import { Apollo } from 'apollo-angular';
import { GraphQLConfigurationResultSet } from '../model/configuration';
import { ConfigRelayVerification } from '../model/config';
import { 
  configurationQueryByConfig, 
  configurationQueryByDomain, 
  configurationQueryByGroup, 
  configurationTreeQuery, 
  snapshotQuery 
} from '../model/graphql-schemas';

@Injectable({
  providedIn: 'root'
})
export class DomainService extends ApiService {

  constructor(
    private readonly http: HttpClient,
    private readonly apollo: Apollo) {
    super();
  }

  public getDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${environment.apiUrl}/domain`).pipe(catchError(super.handleError));
  }

  public getDomainsCollab(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${environment.apiUrl}/domain/collaboration`).pipe(catchError(super.handleError));
  }

  public getDomain(id: string): Observable<Domain> {
    return this.http.get<Domain>(`${environment.apiUrl}/domain/${id}`).pipe(catchError(super.handleError));
  }

  public setDomainEnvironmentStatus(id: string, env: string, status: boolean): Observable<Domain> {
    const body = {
      [`${env}`]: status
    }
    return this.http.patch<Domain>((`${environment.apiUrl}/domain/updateStatus/${id}`), body).pipe(catchError(super.handleError));
  }

  public removeDomainEnvironmentStatus(id: string,  env: string): Observable<Domain> {
    const body = {
      env
    }
    return this.http.patch<Domain>((`${environment.apiUrl}/domain/removeStatus/${id}`), body).pipe(catchError(super.handleError));
  }

  public updateDomain(id: string, description: string): Observable<Domain> {
    const body = {
      description
    }
    return this.http.patch<Domain>((`${environment.apiUrl}/domain/${id}`), body).pipe(catchError(super.handleError));
  }

  public createDomain(name: string, description: string): Observable<Domain> {
    const body = {
      name,
      description
    }
    return this.http.post<Domain>((`${environment.apiUrl}/domain/create`), body).pipe(catchError(super.handleError));
  }

  public deleteDomain(id: string): Observable<Domain> {
    return this.http.delete<Domain>(`${environment.apiUrl}/domain/${id}`).pipe(catchError(super.handleError));
  }

  public requestDomainTransfer(domain: string): Observable<Domain> {
    const body = {
      domain,
    }
    return this.http.patch<Domain>((`${environment.apiUrl}/domain/transfer/request`), body).pipe(catchError(super.handleError));
  }

  public acceptDomainTransfer(domain: string): Observable<Domain> {
    const body = {
      domain,
    }
    return this.http.patch<Domain>((`${environment.apiUrl}/domain/transfer/accept`), body).pipe(catchError(super.handleError));
  }

  public getHistory(id: string, limit: number, skip: number): Observable<History[]> {
    return this.http.get<History[]>(`${environment.apiUrl}/domain/history/${id}`, 
      { 
        params: {
          sortBy: 'date:desc',
          limit,
          skip
      }
    }).pipe(catchError(super.handleError));
  }

  public resetHistory(id: string): Observable<Domain> {
    return this.http.delete<Domain>(`${environment.apiUrl}/domain/history/${id}`).pipe(catchError(super.handleError));
  }

  public getVerificationCode(id: string): Observable<ConfigRelayVerification> {
    return this.http.patch<ConfigRelayVerification>(`${environment.apiUrl}/domain/relay/verificationCode/${id}`, null)
      .pipe(catchError(super.handleError));
  }

  public executeSnapshotQuery(domainId: string, env: string, component: string, includeStatus: boolean, includeDescription: boolean) {
    return this.apollo.query<any>({
      query: snapshotQuery(includeStatus, includeDescription),
      fetchPolicy: 'network-only',
      variables: { 
        id: domainId,
        environment: env,
        _component: component
      }
    });
  }

  public executeConfigurationTreeQuery(domainId: string, switchers: boolean, groups: boolean, components: boolean) {
    return this.apollo.watchQuery<any>({
      query: configurationTreeQuery(switchers, groups, components),
      variables: { 
        id: domainId,
      }
    });
  }

  public executeConfigurationQuery(domainId: string, forceFetch = false) {
    return this.apollo.query<GraphQLConfigurationResultSet>({
      query: configurationQueryByDomain(),
      fetchPolicy: forceFetch ? 'network-only' : 'cache-first',
      variables: { 
        domain: domainId
      }
    });
  }

  public executeConfigurationGroupQuery(domainId: string, groupId: string) {
    return this.apollo.query<GraphQLConfigurationResultSet>({
      query: configurationQueryByGroup(),
      variables: { 
        domain: domainId,
        groupId: groupId
      }
    });
  }

  public executeConfigurationConfigQuery(domainId: string, configId: string) {
    return this.apollo.query<GraphQLConfigurationResultSet>({
      query: configurationQueryByConfig(),
      variables: { 
        domain: domainId,
        configId: configId
      }
    });
  }

}
