import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../services/domain-route.service';
import { PathRoute, Types } from '../model/path-route';
import { ActivatedRoute } from '@angular/router';
import { Domain } from '../model/domain';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-domain-detail',
  templateUrl: './domain-detail.component.html',
  styleUrls: ['./domain-detail.component.css']
})
export class DomainDetailComponent implements OnInit {

  state$: Observable<object>;

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
          this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).element);
        }
      })
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

}
