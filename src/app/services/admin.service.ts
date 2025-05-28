import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Admin } from '../model/admin';
import { ResultPermission } from '../model/permission';

@Injectable({
  providedIn: 'root'
})
export class AdminService extends ApiService {

  constructor(private readonly http: HttpClient) {
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

  public readCollabPermission(domain: string, actions: string[], router: string, elementKey?: string, 
    elementValue?: string, selectedEnvironment = 'default'): Observable<ResultPermission[]> {
    const body = {
      domain,
      action: actions,
      router,
      environment: selectedEnvironment,
      element: {
        [`${elementKey}`]: elementValue
      }
    };

    return this.http.post<ResultPermission[]>(`${environment.apiUrl}/admin/collaboration/permission`, body).pipe(catchError(super.handleError));
  }

  public updateAdmin(name: string): Observable<Admin> {
    const body = { name };
    return this.http.patch<Admin>(`${environment.apiUrl}/admin/me`, body).pipe(catchError(super.handleError));
  }

  public leaveDomain(domain: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/admin/me/team/leave/${domain}`, null).pipe(catchError(super.handleError));
  }
  
  public deleteAdmin(): Observable<Admin> {
    return this.http.delete<Admin>(`${environment.apiUrl}/admin/me`).pipe(catchError(super.handleError));
  }

}
