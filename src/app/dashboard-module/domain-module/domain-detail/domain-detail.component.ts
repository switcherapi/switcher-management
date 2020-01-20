import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DomainRouteService } from '../../services/domain-route.service';
import { PathRoute, Types } from '../model/path-route';
import { ActivatedRoute } from '@angular/router';
import { Domain } from '../model/domain';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DetailComponent } from '../common/detail-component';
import { AdminService } from '../../services/admin.service';
import { EnvironmentConfigComponent } from '../environment-config/environment-config.component';

@Component({
  selector: 'app-domain-detail',
  templateUrl: './domain-detail.component.html',
  styleUrls: ['./domain-detail.component.css']
})
export class DomainDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @ViewChild('envSelectionChange', { static: true })
  private envSelectionChange: EnvironmentConfigComponent;

  state$: Observable<object>;

  constructor(
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute
  ) {
    super(adminService);
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(map(() => window.history.state)).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
        if (data.element) {
          this.updatePathRoute(JSON.parse(data.element));
        } else {
          this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).element);
        }
      });
    
    this.envSelectionChange.statusChanged.pipe(takeUntil(this.unsubscribe)).subscribe(status => {
      this.updateStatus(status);
    });
    
    super.loadAdmin(this.getDomain().owner);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  updatePathRoute(domain: Domain) {
    this.pathRoute = {
      id: domain.id,
      element: domain,
      name: domain.name,
      path: '/dashboard/domain/',
      type: Types.DOMAIN_TYPE
    };

    this.domainRouteService.updatePath(this.pathRoute);
  }

  updateStatus(status: boolean): void {
    this.currentStatus = status;

    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
    }
  }

  getDomain() {
    return this.pathRoute.element;
  }

  edit() {
    this.editing = !this.editing;

    if (this.editing) {
      this.classStatus = 'header editing';
    } else {
      this.classStatus = this.currentStatus ? 'header activated' : 'header deactivated';
    }
  }

}
