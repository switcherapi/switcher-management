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
  export class TeamInviteDialog {
  
    constructor(
      private toastService: ToastService,
      public dialogRef: MatDialogRef<TeamInviteDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }
  
    onCancel() {
      this.dialogRef.close();
    }
  
    onCopy() {
      let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = `${environment.teamInviteLink}?request=${this.data.request_id}`;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
  
      this.toastService.showSuccess(`Team invite copied with success`);
    }
  
  }