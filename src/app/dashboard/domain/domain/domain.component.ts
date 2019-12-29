import { Component, OnInit } from '@angular/core';
import { DomainRouteService } from '../domain-route/domain-route.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Domain } from '../../model/domain';
import { PathRoute } from '../domain-route/path-route';

@Component({
  selector: 'app-domain',
  templateUrl: './domain.component.html',
  styleUrls: ['./domain.component.css']
})
export class DomainComponent implements OnInit {
  constructor(
    private domainRouteSerice: DomainRouteService,
    private router: Router,
    private route: ActivatedRoute,
    private pathRoute: PathRoute
  ) { }

  ngOnInit() {
    this.route.data
    .subscribe((data: { domain: Domain }) => {
      console.log(data)
    });
  }

  getPathRoute() {
    return this.domainRouteSerice;
  }

  getLabelListChildren() {
    if (this.getPathRoute().getCurrentRoute().type === 'Domain') {
      return 'Groups';
    } else if (this.getPathRoute().getCurrentRoute().type === 'Group' || this.getPathRoute().getCurrentRoute().type === 'Config') {
      return 'Switchers';
    }
  }

  gotoListChildren() {
    if (this.getPathRoute().getCurrentRoute().type === 'Domain') {
      this.router.navigate(['/dashboard/domain/groups']);
    } else if (this.getPathRoute().getCurrentRoute().type === 'Group' || this.getPathRoute().getCurrentRoute().type === 'Config') {
      this.router.navigate(['/dashboard/domain/group/configs']);
    }
  }

  gotoDetails() {
    this.router.navigate([this.getPathRoute().getCurrentRoute().path]);
  }

}
