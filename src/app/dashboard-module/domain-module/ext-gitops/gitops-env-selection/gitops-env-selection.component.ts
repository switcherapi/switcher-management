import { Component, inject, signal, DestroyRef } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';

@Component({
    selector: 'app-gitops-env-selection',
    templateUrl: './gitops-env-selection.component.html',
    styleUrls: [
        '../../common/css/detail.component.css',
        '../../common/css/create.component.css',
        './gitops-env-selection.component.css'
    ],
    imports: [MatDialogTitle, MatToolbar, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, 
      MatFormField, MatLabel, MatSelect, FormsModule, ReactiveFormsModule, MatOption, MatDialogActions, MatButton
    ]
})
export class GitOpsEnvSelectionComponent {
  dialogRef = inject<MatDialogRef<GitOpsEnvSelectionComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private readonly environmentService = inject(EnvironmentService);
  private readonly destroyRef = inject(DestroyRef);

  environmentSelection = new FormControl('', [
    Validators.required
  ]);

  environments = signal<Environment[]>([]);

  constructor() {
    // Load environments
    this.environmentService.getEnvironmentsByDomainId(this.data.domainId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(env => {
        const filteredEnv = env.filter(environment => 
          !this.data.excludeEnvironments.includes(environment.name));
        this.environments.set(filteredEnv);
      });

    // Form value changes
    this.environmentSelection.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      this.data.environment = value;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(data: any) {
    const { valid } = this.environmentSelection;

    if (valid) {
        this.dialogRef.close(data);
    }      
  }

}
