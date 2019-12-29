import { Component, OnInit } from '@angular/core';
import { Group } from '../model/group';
import { Observable } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { DomainRouteService } from '../services/domain-route.service';
import { Types } from '../model/path-route';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  groups$: Observable<Group[]>;

  constructor(
    private dashboardService: DashboardService,
    private domainRouteService : DomainRouteService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.groups$ = this.route.paramMap.pipe(
      switchMap(() => {
        return this.dashboardService.getGroupsByDomain(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id);
      })
    );
  }

}
