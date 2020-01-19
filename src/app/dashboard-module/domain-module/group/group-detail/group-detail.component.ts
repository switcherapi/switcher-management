import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomainRouteService } from '../../../services/domain-route.service';
import { PathRoute, Types } from '../../model/path-route';
import { Group } from '../../model/group';
import { map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { DetailComponent } from '../../common/detail-component';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent extends DetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

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
    .pipe(takeUntil(this.unsubscribe), map(() => window.history.state)).subscribe(data => {
      if (data.element) {
        this.updatePathRoute(JSON.parse(data.element));
      } else {
        this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_GROUP).element);
      }
    });

    super.loadAdmin(this.getGroup().owner);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  updatePathRoute(group: Group) {
    this.pathRoute = {
      id: group.id,
      element: group,
      name: group.name,
      path: '/dashboard/domain/group/detail',
      type: Types.GROUP_TYPE
    };

    this.domainRouteService.updatePath(this.pathRoute);
  }

  getGroup() {
    return this.pathRoute.element;
  }

  edit() {
    console.log(this.pathRoute.element.name)
  }

}
