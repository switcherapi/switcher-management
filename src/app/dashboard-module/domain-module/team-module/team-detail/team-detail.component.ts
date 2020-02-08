import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Team } from '../../model/team';
import { map, takeUntil } from 'rxjs/operators';
import { Types } from '../../model/path-route';
import { DomainService } from 'src/app/dashboard-module/services/domain.service';
import { Domain } from '../../model/domain';

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

  constructor(
    private route: ActivatedRoute,
    private team: Team,
    private domainService: DomainService
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(map(() => window.history.state)).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.team) {
        localStorage.setItem(Types.SELECTED_TEAM, data.team);
        this.team = JSON.parse(data.team);
        this.loadDomain(this.team.domain);
      } else {
        this.team = JSON.parse(localStorage.getItem(Types.SELECTED_TEAM));
        this.loadDomain(this.team.domain);
      }
    })
  }

  loadDomain(domainId: string): void {
    this.domainService.getDomain(domainId).pipe(takeUntil(this.unsubscribe)).subscribe(domain => {
      if (domain) {
        this.domain = domain;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}