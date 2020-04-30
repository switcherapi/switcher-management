import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from 'src/app/dashboard-module/services/api.service';
import { SkimmingResponse } from '../model/skimming-response';
import { SkimmingRequest } from '../model/skimming-request';

@Injectable({
  providedIn: 'root'
})
export class SkimmingService extends ApiService {

  constructor(private http: HttpClient) {
    super();
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
