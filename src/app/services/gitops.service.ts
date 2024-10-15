import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { GitOpsAccount } from '../model/gitops';

@Injectable({
  providedIn: 'root'
})
export class GitOpsService extends ApiService {

  constructor(private readonly http: HttpClient) {
    super();
  }

  public findGitOpsAccounts(domainId: string) {
    return this.http.get<GitOpsAccount[]>(`${environment.apiUrl}/gitops/v1/account/${domainId}`)
      .pipe(catchError(super.handleError));
  }

}