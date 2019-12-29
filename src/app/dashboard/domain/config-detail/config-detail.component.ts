import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../services/domain-route.service';
import { PathRoute, Types } from '../model/path-route';
import { Config } from '../model/config';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-config-detail',
  templateUrl: './config-detail.component.html',
  styleUrls: ['./config-detail.component.css']
})
export class ConfigDetailComponent implements OnInit {

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
        this.updatePathRoute(this.domainRouteService.getPathElement(Types.SELECTED_CONFIG).element);
      }
    })
  }

  updatePathRoute(config: Config) {
    this.pathRoute = {
      id: config.id,
      element: config,
      name: config.key,
      path: '/dashboard/domain/group/config/detail',
      type: Types.CONFIG_TYPE
    };

    this.domainRouteService.updatePath(this.pathRoute);
  }

}
