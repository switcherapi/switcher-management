import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SkimmingResponse } from '../model/skimming-response';
import { SkimmingRequest } from '../model/skimming-request';
import { ApiService } from 'src/app/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class SkimmingService extends ApiService {

  private http: HttpClient;

  constructor(handler: HttpBackend) {
    super();
    this.http = new HttpClient(handler);
  }

  public skim(query: string): Observable<SkimmingResponse> {
    const request = new SkimmingRequest();
    request.query = query;

    const params = {
      query: request.query,
      url: request.url,
      files: request.files,
      previewLength: `${request.previewLength}`,
      ignoreCase: `${request.ignoreCase}`,
      trimContent: `${request.trimContent}`
    }

    return this.http.get<SkimmingResponse>(`${environment.skimmingApi}/skim`, { params }).pipe(catchError(super.handleError));
  }

}
