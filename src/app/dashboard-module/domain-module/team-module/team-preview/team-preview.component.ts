import { Component, OnInit, Input, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { TeamComponent } from '../team/team.component';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { Team } from 'src/app/model/team';
import { TeamService } from 'src/app/services/team.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { BasicComponent } from '../../common/basic-component';
import { BlockUIComponent } from '../../../../shared/block-ui/block-ui.component';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { NgStyle, NgClass } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-team-preview',
    templateUrl: './team-preview.component.html',
    styleUrls: [
        '../../common/css/preview.component.css',
        '../../common/css/detail.component.css',
        './team-preview.component.css'
    ],
    imports: [BlockUIComponent, MatFormField, MatLabel, MatInput, FormsModule, NgStyle, 
      ReactiveFormsModule, MatError, MatSlideToggle, NgClass, MatButton, MatIcon, BlockUIComponent
    ]
})
export class TeamPreviewComponent extends BasicComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly _modalService = inject(NgbModal);
  private readonly teamService = inject(TeamService);
  private readonly toastService = inject(ToastService);

  private readonly unsubscribe = new Subject<void>();

  @Input() team: Team;
  @Input() teamListComponent: TeamComponent;
  @Input() updatable = false;
  @Input() removable = false;

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  editing = signal(false);

  toggleSectionStyle = 'toggle-style deactivated';

  constructor() { 
    super();
  }

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
        this.setBlockUI(true, 'Removing team...');
        this.teamService.deleteTeam(this.team._id).pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: team => {
              if (team) {
                this.teamListComponent.removeTeamFromList(this.team);
                this.setBlockUI(false);
                this.toastService.showSuccess('Team removed with success');
              }
            },
            error: error => this.onError(error, `Unable to remove team: '${this.team.name}'`)
          });
      }
    });
  }
  
  edit() {
    if (!this.editing()) {
      this.editing.set(true);
      return;
    }
    
    const { valid } = this.nameFormControl;

    if (this.validateEdition(
        { name: this.team.name }, 
        { name: this.nameFormControl.value })) {
      this.editing.set(false);
      return;
    }

    if (valid) {
      this.editing.set(false);
      this.setBlockUI(true, 'Updating team...');
      this.teamService.updateTeam(this.team._id, this.nameFormControl.value, this.team.active ? 'true' : 'false')
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: team => this.onSuccess(team),
          error: error => this.onError(error, `Unable to update team: '${this.team.name}'`)
        });
    }
  }

  changeStatus(event: MatSlideToggleChange) {
    this.setBlockUI(true, 'Updating status...');
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
    this.setBlockUI(false);
    ConsoleLogger.printError(error);
    this.toastService.showError(message);
  }

  private onSuccess(team: Team): void {
    this.team = team;
    this.setBlockUI(false);
    this.toastService.showSuccess('Team updated with success');
  }

}
