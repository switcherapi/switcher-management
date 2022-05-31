import { Component, Inject } from '@angular/core';
import { ToastService } from 'src/app/_helpers/toast.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'team-invite-dialog',
    templateUrl: 'team-invite-dialog.html',
    styleUrls: [
      '../../common/css/create.component.css',
      '../team-members/team-members.component.css']
  })
  export class TeamInviteDialogComponent {
  
    constructor(
      private toastService: ToastService,
      public dialogRef: MatDialogRef<TeamInviteDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }
  
    onCancel() {
      this.dialogRef.close();
    }
  
    onCopy() {
      this.toastService.showSuccess(`Team invite copied with success`);
    }

    getUrl() {
      return `${environment.teamInviteLink}?request=${this.data.request_id}`;
    }
  
  }