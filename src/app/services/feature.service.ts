import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { HttpClient } from "@angular/common/http";
import { FeatureRequest, FeatureResponse } from "../model/feature";
import { environment } from "src/environments/environment";
import { catchError } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FeatureService extends ApiService {

    constructor(private http: HttpClient) {
        super();
    }

    public isEnabled(featureRequest: FeatureRequest): Observable<FeatureResponse> {
        return this.http.post<FeatureResponse>(`${environment.apiUrl}/api-management/feature`, featureRequest)
            .pipe(catchError(super.handleError));
    }

}