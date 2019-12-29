import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../services/domain-route.service';
import { PathRoute, Types } from '../model/path-route';
import { Group } from '../model/group';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.paramMap
    .pipe(map(() => window.history.state)).subscribe(data => {
      if (data.element) {
        this.updatePathRoute(JSON.parse(data.element));
      } else {
        this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_GROUP).element);
      }
    })
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

}
