import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Team } from '../../model/team';
import { map, takeUntil } from 'rxjs/operators';
import { Types } from '../../model/path-route';

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

  constructor(
    private route: ActivatedRoute,
    private team: Team
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(map(() => window.history.state)).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.team) {
        localStorage.setItem(Types.SELECTED_TEAM, data.team);
        this.team = JSON.parse(data.team)
      } else {
        this.team = JSON.parse(localStorage.getItem(Types.SELECTED_TEAM));
      }
    })
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}