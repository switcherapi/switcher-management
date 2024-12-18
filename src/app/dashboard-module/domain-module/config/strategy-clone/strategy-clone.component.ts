import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';

@Component({
  selector: 'app-strategy-clone',
  templateUrl: './strategy-clone.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './strategy-clone.component.css'
  ],
  standalone: false
})
export class StrategyCloneComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();

  environmentSelection = new FormControl('', [
    Validators.required
  ]);

  environments: Environment[];

  constructor(
    public dialogRef: MatDialogRef<StrategyCloneComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly environmentService: EnvironmentService) { }

  ngOnInit() {
    this.environmentService.getEnvironmentsByDomainId(this.data.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(env => {
        this.environments = env;
        this.environments = this.environments.filter(environment => environment.name !== this.data.currentEnvironment);
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
