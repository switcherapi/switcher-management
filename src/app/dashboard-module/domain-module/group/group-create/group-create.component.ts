import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput, MatError, MatHint } from '@angular/material/input';

@Component({
    selector: 'app-group-create',
    templateUrl: './group-create.component.html',
    styleUrls: [
        '../../common/css/detail.component.css',
        '../../common/css/create.component.css',
        './group-create.component.css'
    ],
    imports: [MatDialogTitle, MatToolbar, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, FormsModule, 
      ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatHint, MatDialogActions, MatButton
    ]
})
export class GroupCreateComponent implements OnInit, OnDestroy {
  dialogRef = inject<MatDialogRef<GroupCreateComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);

  private readonly unsubscribe = new Subject<void>();

  elementCreationFormGroup: FormGroup;

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(30)
  ]);

  descFormControl = new FormControl('', [
    Validators.maxLength(256)
  ]);

  ngOnInit(): void {
    this.elementCreationFormGroup = this.formBuilder.group({
      nameFormControl: this.nameFormControl,
      descFormControl: this.descFormControl
    });

    this.nameFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.name = value;
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
