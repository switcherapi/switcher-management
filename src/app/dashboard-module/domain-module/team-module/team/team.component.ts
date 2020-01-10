import { Component, OnInit, OnDestroy } from '@angular/core';
import { Team } from '../../model/team';
import { DomainRouteService } from '../../../services/domain-route.service';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Types } from '../../model/path-route';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TeamService } from 'src/app/dashboard-module/services/team.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  teams$: Team[];
  loading = false;
  error = '';

  constructor(
    private teamService: TeamService,
    private domainRouteService : DomainRouteService,
    private errorHandler: RouterErrorHandler
  ) { }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.teamService.getTeamsByDomain(
      this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id).pipe(takeUntil(this.unsubscribe)).subscribe(data => {

      if (data) {
        this.teams$ = data;
      }
      this.loading = false;
    }, error => {
      this.error = this.errorHandler.doError(error);
      this.loading = false;
    });

    setTimeout(() => {
      if (!this.teams$) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    }, environment.timeout);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
