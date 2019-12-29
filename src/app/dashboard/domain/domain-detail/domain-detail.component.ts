import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../domain-route/domain-route.service';
import { PathRoute } from '../domain-route/path-route';
import { ActivatedRoute } from '@angular/router';
import { Domain } from '../../model/domain';

@Component({
  selector: 'app-domain-detail',
  templateUrl: './domain-detail.component.html',
  styleUrls: ['./domain-detail.component.css']
})
export class DomainDetailComponent implements OnInit {

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.data
    .subscribe((data: { domain: Domain }) => {
      this.updatePathRoute(data.domain);
    });
    
  }

  updatePathRoute(domain: Domain) {
    this.domainRouteService.clearPath();
    
    this.pathRoute = {
      id: domain.id,
      name: domain.name,
      path: '/dashboard/domain/' + domain.id,
      type: 'Domain'
    };

    this.domainRouteService.updatePath(this.pathRoute);
  }

}
