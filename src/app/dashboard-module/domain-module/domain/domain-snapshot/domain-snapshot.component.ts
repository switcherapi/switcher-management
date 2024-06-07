import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';
import { DomainService } from 'src/app/services/domain.service';
import { ComponentService } from 'src/app/services/component.service';
import { SwitcherComponent } from 'src/app/model/switcher-component';

@Component({
  selector: 'app-domain-snapshot',
  templateUrl: './domain-snapshot.component.html',
  styleUrls: [
    '../../common/css/detail.component.css',
    '../../common/css/create.component.css',
    './domain-snapshot.component.css'
  ]
})
export class DomainSnapshotComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;
  
  componentSelection = new FormControl('-', []);
  environmentSelection = new FormControl('default', [
    Validators.required
  ]);


  components: SwitcherComponent[];
  environments: Environment[];

  private domainId: string;

  includeStatus: boolean = true;
  includeDescription: boolean = true;
  snapshot: string;

  constructor(
    public dialogRef: MatDialogRef<DomainSnapshotComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private environmentService: EnvironmentService,
    private componentService: ComponentService,
    private domainService: DomainService,
    private toastService: ToastService
  ) { 
    this.domainId = data.domainId;
  }

  ngOnInit() {
    this.environmentService.getEnvironmentsByDomainId(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(environments => {
        this.environments = environments;
        this.environments = this.environments.filter(environment => environment.name !== this.data.currentEnvironment);
      });

    this.componentService.getComponentsByDomain(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(components => {
        this.components = [{ name: '-' } as SwitcherComponent];
        this.components.push(...components);
      });

    this.environmentSelection.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.environment = value;
    });
    
    this.componentSelection.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.component = value;
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDownload() {
    const { valid } = this.environmentSelection;

    if (valid) {
      const component = this.componentSelection.value === '-' ? null : this.componentSelection.value;
      const environment = this.environmentSelection.value;

      this.blockUI.start('Downloading...');
      this.snapshot = null;
      this.domainService.executeSnapshotQuery(
        this.domainId, environment, component, this.includeStatus, this.includeDescription)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: result => {
            if (result) {
              const omitTypename = (key: any, value: any) => key === "__typename" ? undefined : value;
              this.snapshot = JSON.stringify(JSON.parse(JSON.stringify(result.data), omitTypename), null, 2);
              this.lockEnvSelection();
              this.toastService.showSuccess(`Snapshot downloaded with success`);
            }
            this.blockUI.stop();
          },
          error: error => {
            ConsoleLogger.printError(error);
            this.blockUI.stop();
          }
        });
    }      
  }

  onCopy() {
    this.snapshot = null;
    this.lockEnvSelection();
    this.toastService.showSuccess(`Snapshot copied with success`);
  }

  private lockEnvSelection(): void {
    if (this.snapshot) {
      this.environmentSelection.disable({ onlySelf: true });
      this.componentSelection.disable({ onlySelf: true });
    } else {
      this.environmentSelection.enable({ onlySelf: true });
      this.componentSelection.enable({ onlySelf: true });
    }
  }

}