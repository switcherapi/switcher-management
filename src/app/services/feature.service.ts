import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { HttpBackend, HttpClient } from "@angular/common/http";
import { FeatureRequest, FeatureResponse } from "../model/feature";
import { environment } from "src/environments/environment";
import { catchError } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FeatureService extends ApiService {

    private http: HttpClient;

    constructor(handler: HttpBackend) {
      super();
      this.http = new HttpClient(handler);
    }

    public isEnabled(featureRequest: FeatureRequest): Observable<FeatureResponse> {
        return this.http.post<FeatureResponse>(`${environment.apiFeatureUrl}`, featureRequest)
            .pipe(catchError(super.handleError));
    }

}