import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-config-create',
  templateUrl: './config-create.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './config-create.component.css'
  ]
})
export class ConfigCreateComponent implements OnInit {

  elementCreationFormGroup: FormGroup;

  keyFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);

  descFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);

  constructor(
    public dialogRef: MatDialogRef<ConfigCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.elementCreationFormGroup = this.formBuilder.group({
      keyFormControl: this.keyFormControl,
      descFormControl: this.descFormControl
    });

    this.keyFormControl.valueChanges.subscribe(value => {
      this.data.key = value;
    })

    this.descFormControl.valueChanges.subscribe(value => {
      this.data.description = value;
    })
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
