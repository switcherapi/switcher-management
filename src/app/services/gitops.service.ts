import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { GitOpsAccount, GitOpsAccountTokenResponse, TOKEN_VALUE } from '../model/gitops';

@Injectable({
  providedIn: 'root'
})
export class GitOpsService extends ApiService {
  private readonly http = inject(HttpClient);
  
  constructor() {
    super();
  }

  public subscribeGitOpsAccount(gitOpsAccount: GitOpsAccount) {
    return this.http.post<GitOpsAccount>(`${environment.apiUrl}/gitops/v1/account/subscribe`, {
      environment: gitOpsAccount.environment,
      repository: gitOpsAccount.repository,
      branch: gitOpsAccount.branch,
      path: gitOpsAccount.path,
      token: gitOpsAccount.token,
      settings: gitOpsAccount.settings,
      domain: {
        id: gitOpsAccount.domain.id,
        name: gitOpsAccount.domain.name
      }
    })
      .pipe(catchError(super.handleError));
  }

  public unsubscribeGitOpsAccount(gitOpsAccount: GitOpsAccount) {
    return this.http.post<GitOpsAccount>(`${environment.apiUrl}/gitops/v1/account/unsubscribe`, {
      environment: gitOpsAccount.environment,
      domain: {
        id: gitOpsAccount.domain.id
      }
    })
      .pipe(catchError(super.handleError));
  }

  public findGitOpsAccounts(domainId: string) {
    return this.http.get<GitOpsAccount[]>(`${environment.apiUrl}/gitops/v1/account/${domainId}`)
      .pipe(catchError(super.handleError));
  }

  public findGitOpsAccount(gitOpsAccount: GitOpsAccount) {
    const gitOpsDomainId = gitOpsAccount.domain.id;
    const gitOpsEnvironment = gitOpsAccount.environment;

    return this.http.get<GitOpsAccount[]>(`${environment.apiUrl}/gitops/v1/account/${gitOpsDomainId}?environment=${gitOpsEnvironment}`)
      .pipe(catchError(super.handleError));
  }

  public forceRefreshGitOpsAccount(gitOpsAccount: GitOpsAccount) {
    return this.http.put<GitOpsAccount>(`${environment.apiUrl}/gitops/v1/account/forcesync`, {
      environment: gitOpsAccount.environment,
      domain: {
        id: gitOpsAccount.domain.id
      }
    }).pipe(catchError(super.handleError));
  }

  public updateGitOpsAccount(gitOpsAccount: GitOpsAccount) {
    return this.http.put<GitOpsAccount>(`${environment.apiUrl}/gitops/v1/account`, {
      environment: gitOpsAccount.environment,
      repository: gitOpsAccount.repository,
      branch: gitOpsAccount.branch,
      path: gitOpsAccount.path,
      token: gitOpsAccount.token === TOKEN_VALUE ? '' : gitOpsAccount.token,
      settings: gitOpsAccount.settings,
      domain: {
        id: gitOpsAccount.domain.id,
        name: gitOpsAccount.domain.name
      }
    })
      .pipe(catchError(super.handleError));
  }

  public updateGitOpsAccountTokens(token: string, domainId: string, environments: string[]) {
    return this.http.put<GitOpsAccountTokenResponse>(`${environment.apiUrl}/gitops/v1/account/tokens`, {
      token,
      environments,
      domain: {
        id: domainId
      }
    })
      .pipe(catchError(super.handleError));
  }

}