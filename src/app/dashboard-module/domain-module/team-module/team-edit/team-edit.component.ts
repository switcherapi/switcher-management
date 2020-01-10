import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Team } from '../../model/team';

@Component({
  selector: 'app-team-edit',
  templateUrl: './team-edit.component.html',
  styleUrls: ['./team-edit.component.css']
})
export class TeamEditComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private team: Team
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(map(() => window.history.state)).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data.team) {
        this.team = JSON.parse(data.team)
      }
    })
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
