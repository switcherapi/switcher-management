import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-domain-create',
  templateUrl: './domain-create.component.html',
  styleUrls: [
    '../domain-module/common/css/detail.component.css',
    '../domain-module/common/css/create.component.css',
    './domain-create.component.css'
  ]
})
export class DomainCreateComponent implements OnInit {

  nameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(5)
  ]);

  constructor(
    public dialogRef: MatDialogRef<DomainCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.nameFormControl.valueChanges.subscribe(value => {
      this.data.name = value;
    })
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

  copyKey(val: string){
    let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = val;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
    }

}
