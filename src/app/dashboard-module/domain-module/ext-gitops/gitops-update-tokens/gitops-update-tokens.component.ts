import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-gitops-update-tokens',
  templateUrl: './gitops-update-tokens.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './gitops-update-tokens.component.css'
  ],
  standalone: false
})
export class GitOpsUpdateTokensComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();

  environments: string[];
  token: string;
  formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialogRef: MatDialogRef<GitOpsUpdateTokensComponent>,
    private readonly fb: FormBuilder) { }

  ngOnInit() {
    this.environments = this.data.environments;
    this.formInit();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(data: any) {
    const { valid } = this.formGroup;

    if (valid) {
        this.dialogRef.close(data);
    }      
  }

  private formInit(): void {
    this.formGroup = this.fb.group({
      environment: new FormControl('', [Validators.required]),
      token: new FormControl('', [Validators.required])
    });

    this.formGroup.get('environment').valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(value => this.data.selection = value);

    this.formGroup.get('token').valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(value => this.data.token = value);
  }

}
