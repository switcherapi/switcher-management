import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-config-create',
  templateUrl: './config-create.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './config-create.component.css'
  ]
})
export class ConfigCreateComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();

  elementCreationFormGroup: FormGroup;

  keyFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(30)
  ]);

  descFormControl = new FormControl('', [
    Validators.maxLength(256)
  ]);

  constructor(
    public dialogRef: MatDialogRef<ConfigCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.elementCreationFormGroup = this.formBuilder.group({
      keyFormControl: this.keyFormControl,
      descFormControl: this.descFormControl
    });

    this.keyFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.key = value;
    });

    this.descFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.description = value;
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(data: any) {
    const { valid } = this.elementCreationFormGroup;

    if (valid) {
        this.dialogRef.close(data);
    }      
  }

}
