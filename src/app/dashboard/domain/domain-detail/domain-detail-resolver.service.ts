
import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { DashboardService } from '../../services/dashboard.service';
import { Domain } from '../../model/domain';

@Injectable({
  providedIn: 'root',
})
export class DomainDetailResolverService implements Resolve<Domain> {
  constructor(private dashboardService: DashboardService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Domain> | Observable<never> {
    let id = route.paramMap.get('id');

    return this.dashboardService.getDomain(id).pipe(
      take(1),
      mergeMap(domain => {
        if (domain) {
          return of(domain);
        } else {
          this.router.navigate(['/dashboard']);
          return EMPTY;
        }
      })
    );
  }
}
