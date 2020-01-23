import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

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

  keyFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);

  constructor(
    public dialogRef: MatDialogRef<ConfigCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.keyFormControl.valueChanges.subscribe(value => {
      this.data.key = value;
    })
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(data: any) {
    const { valid } = this.keyFormControl;

    if (valid) {
        this.dialogRef.close(data);
    }      
  }

}
