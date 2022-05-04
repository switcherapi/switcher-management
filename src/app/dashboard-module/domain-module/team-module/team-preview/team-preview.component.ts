import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { TeamComponent } from '../team/team.component';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { FormControl, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Team } from 'src/app/model/team';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-preview',
  templateUrl: './team-preview.component.html',
  styleUrls: [
    '../../common/css/preview.component.css',
    '../../common/css/detail.component.css',
    './team-preview.component.css']
})
export class TeamPreviewComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;

  @Input() team: Team;
  @Input() teamListComponent: TeamComponent;
  @Input() updatable: boolean = false;
  @Input() removable: boolean = false;

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  editing: boolean;

  toggleSectionStyle: string = 'toggle-style deactivated';

  constructor(
    private router: Router,
    private teamService: TeamService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.nameFormControl.setValue(this.team.name);
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
    }, error => this.onError(error, `Unable to remove team: '${this.team.name}'`));
  }
  
  edit() {
    if (!this.editing) {
      this.editing = true;
    } else {
      const { valid } = this.nameFormControl;

      if (this.validateEdition(
          { name: this.team.name }, 
          { name: this.nameFormControl.value })) {
        this.editing = false;
        return;
      }

      if (valid) {
        this.editing = false;
        this.blockUI.start('Updating Team...');
        this.teamService.updateTeam(this.team._id, this.nameFormControl.value, this.team.active ? 'true' : 'false')
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(team => this.onSuccess(team), error => this.onError(error, `Unable to update team: '${this.team.name}'`));
      }
    }
  }

  changeStatus(event: MatSlideToggleChange) {
    this.blockUI.start('Updating status...');
    this.teamService.updateTeam(this.team._id, this.team.name, event.checked ? 'true' : 'false')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(team => this.onSuccess(team), error => this.onError(error, `Unable to update team: '${this.team.name}'`));
  }

  validateEdition(oldObject: any, newObject: any): boolean {
    const fields = Object.keys(oldObject);
    const changed = fields.filter(field => oldObject[`${field}`] != newObject[`${field}`]);
    return !changed.length;
  }

  private onError(error: any, message: string): void {
    this.blockUI.stop();
    ConsoleLogger.printError(error);
    this.toastService.showError(message);
  }

  private onSuccess(team: Team): void {
    this.team = team;
    this.blockUI.stop();
    this.toastService.showSuccess(`Team updated with success`);
  }

}
