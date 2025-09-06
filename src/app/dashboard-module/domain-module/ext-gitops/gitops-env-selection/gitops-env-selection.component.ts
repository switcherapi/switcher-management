import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
export class GitOpsEnvSelectionComponent implements OnInit, OnDestroy {
  dialogRef = inject<MatDialogRef<GitOpsEnvSelectionComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private readonly environmentService = inject(EnvironmentService);

  private readonly unsubscribe = new Subject<void>();

  environmentSelection = new FormControl('', [
    Validators.required
  ]);

  environments: Environment[];

  ngOnInit() {
    this.environmentService.getEnvironmentsByDomainId(this.data.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(env => {
        this.environments = env.filter(environment => 
          this.data.excludeEnvironments.indexOf(environment.name) === -1);
      });

    this.environmentSelection.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.environment = value;
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
    const { valid } = this.environmentSelection;

    if (valid) {
        this.dialogRef.close(data);
    }      
  }

}
