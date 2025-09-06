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
    selector: 'domain-transfer-dialog',
    templateUrl: 'domain-transfer-dialog.html',
    styleUrls: [
        '../../common/css/create.component.css',
        './domain-transfer.component.css'
    ],
    imports: [MatDialogTitle, MatToolbar, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, 
      MatFormField, MatLabel, MatInput, FormsModule, MatDialogActions, MatButton, CdkCopyToClipboard
    ]
})
  export class DomainTransferDialogComponent {
    private readonly toastService = inject(ToastService);
    dialogRef = inject<MatDialogRef<DomainTransferDialogComponent>>(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
  
    onCancel() {
      this.dialogRef.close();
    }
  
    onCopy() {
      this.toastService.showSuccess(`Domain transfer link copied with success`);
    }

    getUrl() {
      return encodeURI(`${environment.domainTransferLink}?request=${this.data.request_id}&domain=${this.data.domain}`);
    }
  
  }