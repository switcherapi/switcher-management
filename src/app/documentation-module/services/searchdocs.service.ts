import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchDocsResponse } from '../model/searchdocs-response';
import { SearchDocsRequest } from '../model/searchdocs-request';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SearchDocsService extends ApiService {

  private readonly http: HttpClient;

  constructor() {
    const handler = inject(HttpBackend);

    super();
    this.http = new HttpClient(handler);
  }

  public search(query: string): Observable<SearchDocsResponse> {
    const request = new SearchDocsRequest();
    request.query = query;

    const params = {
      query: request.query,
      previewLength: `${request.previewLength}`,
      ignoreCase: `${request.ignoreCase}`,
      trimContent: `${request.trimContent}`
    }

    return this.http.get<SearchDocsResponse>(`${environment.apiSearchDocsUrl}/`, { params }).pipe(catchError(super.handleError));
  }

}
