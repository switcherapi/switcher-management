import { Component, OnInit, Input, Inject, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EnvironmentService } from 'src/app/dashboard-module/services/environment.service';
import { DomainRouteService } from 'src/app/dashboard-module/services/domain-route.service';
import { Types } from '../../model/path-route';
import { Environment } from '../../model/environment';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-strategy-clone',
  templateUrl: './strategy-clone.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './strategy-clone.component.css']
})
export class StrategyCloneComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  environmentSelection = new FormControl('', [
    Validators.required
  ]);

  environments: Environment[];

  constructor(
    public dialogRef: MatDialogRef<StrategyCloneComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private environmentService: EnvironmentService,
    private domainRouteService: DomainRouteService) { }

  ngOnInit() {
    this.environmentService.getEnvironmentsByDomainId(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id)
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
