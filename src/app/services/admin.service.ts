import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Admin } from '../model/admin';

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

  public readCollabPermission(domain: string, actions: string[], router: string, elementKey: string, elementValue: string): Observable<any> {
    const body = {
      domain,
      action: actions,
      router,
      element: {
        [`${elementKey}`]: elementValue
      }
    };

    return this.http.post<any>(`${environment.apiUrl}/admin/collaboration/permission`, body).pipe(catchError(super.handleError));
  }

  public requestPasswordReset(email: string): Observable<any> {
    const body = { email };
    return this.http.post<any>(`${environment.apiUrl}/admin/login/request/recovery`, body).pipe(catchError(super.handleError));
  }

  public updateAdmin(name: string): Observable<any> {
    const body = { name };
    return this.http.patch<any>(`${environment.apiUrl}/admin/me`, body).pipe(catchError(super.handleError));
  }

  public leaveDomain(domain: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/admin/me/team/leave/${domain}`, null).pipe(catchError(super.handleError));
  }
  
  public deleteAdmin(): Observable<Admin> {
    return this.http.delete<Admin>(`${environment.apiUrl}/admin/me`).pipe(catchError(super.handleError));
  }

}
