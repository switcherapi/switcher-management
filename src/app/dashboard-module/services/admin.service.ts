import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Admin } from '../domain-module/model/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminService extends ApiService {

  constructor(private http: HttpClient) {
    super();
  }

  public getAdmin(): Observable<Admin> {
    return this.http.get<Admin>(`${environment.apiUrl}/admin/me`).pipe(catchError(super.handleError));
  }

  public getAdminById(id: string): Observable<Admin> {
    return this.http.get<Admin>(`${environment.apiUrl}/admin/${id}`).pipe(catchError(super.handleError));
  }

  public getAdminCollab(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/admin/collaboration`).pipe(catchError(super.handleError));
  }

}
