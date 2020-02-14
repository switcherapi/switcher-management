import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Team } from '../../model/team';
import { Router } from '@angular/router';
import { MatSlideToggleChange } from '@angular/material';
import { TeamService } from 'src/app/dashboard-module/services/team.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { TeamComponent } from '../team/team.component';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-team-preview',
  templateUrl: './team-preview.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    './team-preview.component.css']
})
export class TeamPreviewComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;

  @Input() team: Team;
  @Input() teamListComponent: TeamComponent;
  @Input() updatable: boolean = true;
  @Input() removable: boolean = true;

  editing: boolean;

  constructor(
    private router: Router,
    private teamService: TeamService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getTeamName() {
    return this.team.name;
  }

  getTeam() {
    return this.team;
  }

  selectTeam() {
    this.router.navigate(['/dashboard/domain/team/detail'], { state: { team: JSON.stringify(this.team) } });
  }

  removeTeam() {
    this.blockUI.start('Removing team...');
    this.teamService.deleteTeam(this.team._id).pipe(takeUntil(this.unsubscribe)).subscribe(team => {
        if (team) {
          this.teamListComponent.removeTeamFromList(team);
          this.blockUI.stop();
          this.toastService.showSuccess(`Team removed with success`);
        }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to remove team: '${this.team.name}'`);
    })
  }
  
  edit() {
    if (!this.editing) {
      this.editing = true;
    } else {
      this.editing = false;
    }
  }

  changeStatus(event: MatSlideToggleChange) {
    this.blockUI.start('Updating status...');
    this.teamService.updateTeam(this.team._id, this.team.name, event.checked ? 'true' : 'false')
      .pipe(takeUntil(this.unsubscribe)).subscribe(team => {
        if (team) {
          this.team = team;
          this.blockUI.stop();
          this.toastService.showSuccess(`Team updated with success`);
        }
    }, error => {
      this.blockUI.stop();
      ConsoleLogger.printError(error);
      this.toastService.showError(`Unable to update team: '${this.team.name}'`);
    })
  }

}
