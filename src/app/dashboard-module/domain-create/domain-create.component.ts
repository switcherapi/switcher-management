import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-domain-create',
  templateUrl: './domain-create.component.html',
  styleUrls: [
    '../domain-module/common/css/detail.component.css',
    '../domain-module/common/css/create.component.css',
    './domain-create.component.css'
  ],
  standalone: false
})
export class DomainCreateComponent implements OnInit, OnDestroy {
  dialogRef = inject<MatDialogRef<DomainCreateComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  private readonly unsubscribe = new Subject<void>();

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(30)
  ]);

  ngOnInit(): void {
    this.nameFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.name = value;
    })
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(data: any) {
    const { valid } = this.nameFormControl;

    if (valid) {
        this.dialogRef.close(data);
    }      
  }

}
