import { Component, OnInit, Input } from '@angular/core';
import { Domain } from '../model/domain';
import { DomainRouteService } from '../domain/domain-route/domain-route.service';
import { PathRoute } from '../domain/domain-route/path-route';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-domain-preview',
  templateUrl: './domain-preview.component.html',
  styleUrls: ['./domain-preview.component.css']
})
export class DomainPreviewComponent implements OnInit {
  @Input() domain: Domain;

  constructor(
    private domainRouteService: DomainRouteService,
    private pathRoute: PathRoute,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
  }

  getDomainName() {
    return this.domain.name;
  }

  getDomain() {
    return this.domain;
  }

  selectDomain() {
    this.pathRoute = {
      id: this.domain.id,
      name: this.domain.name,
      path: '/dashboard/domain',
      type: 'Domain'
    };
    
    this.domainRouteService.updatePath(this.pathRoute);
  }

}
