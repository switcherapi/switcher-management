import { Component, inject } from '@angular/core';
import { ToastService } from 'src/app/_helpers/toast.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';

@Component({
    selector: 'team-invite-dialog',
    templateUrl: 'team-invite-dialog.html',
    styleUrls: [
        '../../common/css/create.component.css',
        '../team-members/team-members.component.css'
    ],
    imports: [MatDialogTitle, MatToolbar, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, 
      MatFormField, MatLabel, MatInput, FormsModule, MatDialogActions, MatButton, CdkCopyToClipboard
    ]
})
  export class TeamInviteDialogComponent {
    private readonly toastService = inject(ToastService);
    dialogRef = inject<MatDialogRef<TeamInviteDialogComponent>>(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
  
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