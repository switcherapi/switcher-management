import { Component, inject, signal, DestroyRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';

@Component({
    selector: 'app-gitops-update-tokens',
    templateUrl: './gitops-update-tokens.component.html',
    styleUrls: [
        '../../common/css/detail.component.css',
        '../../common/css/create.component.css',
        './gitops-update-tokens.component.css'
    ],
    imports: [MatDialogTitle, MatToolbar, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, MatFormField, 
      MatLabel, MatSelect, FormsModule, ReactiveFormsModule, MatOption, MatInput, MatDialogActions, MatButton
    ]
})
export class GitOpsUpdateTokensComponent {
  data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<GitOpsUpdateTokensComponent>>(MatDialogRef);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  environments = signal<string[]>([]);
  token = signal<string>('');
  formGroup = signal<FormGroup>(null);
  
  constructor() {
    this.environments.set(this.data.environments);
    this.formInit();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(data: any) {
    const formGroup = this.formGroup();
    const { valid } = formGroup;

    if (valid) {
        this.dialogRef.close(data);
    }      
  }

  private formInit(): void {
    const formGroup = this.fb.group({
      environment: new FormControl('', [Validators.required]),
      token: new FormControl('', [Validators.required])
    });
    
    this.formGroup.set(formGroup);

    formGroup.get('environment').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.data.selection = value);

    formGroup.get('token').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.data.token = value);
  }

}
