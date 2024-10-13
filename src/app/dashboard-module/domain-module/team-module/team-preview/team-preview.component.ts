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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';

@Component({
  selector: 'app-team-preview',
  templateUrl: './team-preview.component.html',
  styleUrls: [
    '../../common/css/preview.component.css',
    '../../common/css/detail.component.css',
    './team-preview.component.css']
})
export class TeamPreviewComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();

  @BlockUI() blockUI: NgBlockUI;

  @Input() team: Team;
  @Input() teamListComponent: TeamComponent;
  @Input() updatable = false;
  @Input() removable = false;

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  editing: boolean;

  toggleSectionStyle = 'toggle-style deactivated';

  constructor(
    private readonly router: Router,
    private readonly _modalService: NgbModal,
    private readonly teamService: TeamService,
    private readonly toastService: ToastService
  ) { }

  ngOnInit() {
    this.nameFormControl.setValue(this.team.name);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  selectTeam() {
    const domainId = this.teamListComponent.domainId;
    const domainName = encodeURIComponent(this.teamListComponent.domainName);
    this.router.navigate([`/dashboard/domain/${domainName}/${domainId}/teams/${this.team._id}`], 
      { state: { team: JSON.stringify(this.team), fetch: false } });
  }

  removeTeam() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Team Removal';
    modalConfirmation.componentInstance.question = `Are you sure you want to remove ${this.team.name}?`;
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Removing team...');
        this.teamService.deleteTeam(this.team._id).pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: team => {
              if (team) {
                this.teamListComponent.removeTeamFromList(team);
                this.blockUI.stop();
                this.toastService.showSuccess(`Team removed with success`);
              }
            },
            error: error => this.onError(error, `Unable to remove team: '${this.team.name}'`)
          });
      }
    });
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
          .subscribe({
            next: team => this.onSuccess(team),
            error: error => this.onError(error, `Unable to update team: '${this.team.name}'`)
          });
      }
    }
  }

  changeStatus(event: MatSlideToggleChange) {
    this.blockUI.start('Updating status...');
    this.teamService.updateTeam(this.team._id, this.team.name, event.checked ? 'true' : 'false')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: team => this.onSuccess(team),
        error: error => this.onError(error, `Unable to update team: '${this.team.name}'`)
      });
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
