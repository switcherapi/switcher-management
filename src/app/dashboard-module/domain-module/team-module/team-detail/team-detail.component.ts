import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Team } from '../../model/team';
import { map, takeUntil } from 'rxjs/operators';
import { Types } from '../../model/path-route';
import { DomainService } from 'src/app/dashboard-module/services/domain.service';
import { Domain } from '../../model/domain';
import { DomainRouteService } from 'src/app/dashboard-module/services/domain-route.service';
import { AdminService } from 'src/app/dashboard-module/services/admin.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './team-detail.component.css'
  ]
})
export class TeamDetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  domain: Domain;

  updatable: boolean = false;
  removable: boolean = false;
  creatable: boolean = false;

  loading: boolean = false;

  constructor(
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private team: Team,
    private domainService: DomainService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.route.paramMap.pipe(map(() => window.history.state)).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.team) {
        localStorage.setItem(Types.SELECTED_TEAM, data.team);
        this.readPermissionToObject(JSON.parse(data.team));
        this.loadDomain(this.team.domain);
      } else {
        this.readPermissionToObject(JSON.parse(localStorage.getItem(Types.SELECTED_TEAM)));
        this.loadDomain(this.team.domain);
      }
    })
  }

  loadDomain(domainId: string): void {
    this.domainService.getDomain(domainId).pipe(takeUntil(this.unsubscribe)).subscribe(domain => {
      if (domain) {
        this.domain = domain;
      }
    }, error => {
      ConsoleLogger.printError(error);
    }, () => {
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  readPermissionToObject(team: Team): void {
    const domain = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN);
    this.adminService.readCollabPermission(domain.id, ['CREATE', 'UPDATE', 'DELETE'], 'ADMIN', 'name', domain.name)
      .pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.length) {
        data.forEach(element => {
          if (element.action === 'UPDATE') {
            this.updatable = element.result === 'ok' ? true : false;
          } else if (element.action === 'DELETE') {
            this.removable = element.result === 'ok' ? true : false;
          } else if (element.action === 'CREATE') {
            this.creatable = element.result === 'ok' ? true : false;
          }
        });
      }
    });

    if (team) {
      this.team = team;
    }
  }

  getTeam(): Team {
    return this.team;
  }

}