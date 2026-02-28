import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FeatureRequest, FeatureResponse } from '../model/feature';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FeatureService extends ApiService {

    private readonly http: HttpClient;

    constructor() {
      const handler = inject(HttpBackend);

      super();
      this.http = new HttpClient(handler);
    }

    public isEnabled(featureRequest: FeatureRequest): Observable<FeatureResponse> {
        return this.http.post<FeatureResponse>(`${environment.apiFeatureUrl}`, featureRequest)
            .pipe(catchError(super.handleError));
    }

}