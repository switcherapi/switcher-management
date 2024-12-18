import { Component, Inject } from '@angular/core';
import { ToastService } from 'src/app/_helpers/toast.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'domain-transfer-dialog',
    templateUrl: 'domain-transfer-dialog.html',
    styleUrls: [
      '../../common/css/create.component.css',
      './domain-transfer.component.css'
    ],
    standalone: false
  })
  export class DomainTransferDialogComponent {
  
    constructor(
      private readonly toastService: ToastService,
      public dialogRef: MatDialogRef<DomainTransferDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { }
  
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