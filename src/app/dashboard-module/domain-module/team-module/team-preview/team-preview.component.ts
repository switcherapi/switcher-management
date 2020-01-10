import { Component, OnInit, Input } from '@angular/core';
import { Team } from '../../model/team';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team-preview',
  templateUrl: './team-preview.component.html',
  styleUrls: ['./team-preview.component.css']
})
export class TeamPreviewComponent implements OnInit {
  @Input() team: Team;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  getTeamName() {
    return this.team.name;
  }

  getTeam() {
    return this.team;
  }

  selectTeam() {
    this.router.navigate(['/dashboard/domain/team/edit'], { state: { team: JSON.stringify(this.team) } });
  }


}
