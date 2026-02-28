import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';
import { DomainService } from 'src/app/services/domain.service';
import { ComponentService } from 'src/app/services/component.service';
import { SwitcherComponent } from 'src/app/model/switcher-component';
import { BasicComponent } from '../../common/basic-component';
import { BlockUIComponent } from '../../../../shared/block-ui/block-ui.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatCheckbox } from '@angular/material/checkbox';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';

@Component({
    selector: 'app-domain-snapshot',
    templateUrl: './domain-snapshot.component.html',
    styleUrls: [
        '../../common/css/detail.component.css',
        '../../common/css/create.component.css',
        './domain-snapshot.component.css'
    ],
    imports: [BlockUIComponent, MatDialogTitle, MatToolbar, MatIconButton, MatIcon, MatDialogContent, 
      MatFormField, MatLabel, MatSelect, FormsModule, ReactiveFormsModule, MatOption, MatCheckbox, 
      MatDialogActions, MatButton, CdkCopyToClipboard
    ]
})
export class DomainSnapshotComponent extends BasicComponent implements OnInit {
  dialogRef = inject<MatDialogRef<DomainSnapshotComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private readonly environmentService = inject(EnvironmentService);
  private readonly componentService = inject(ComponentService);
  private readonly domainService = inject(DomainService);
  private readonly toastService = inject(ToastService);
  
  componentSelection = new FormControl('-', []);
  environmentSelection = new FormControl('default', [
    Validators.required
  ]);

  components = signal<SwitcherComponent[]>([]);
  environments = signal<Environment[]>([]);
  includeStatus = signal(true);
  includeDescription = signal(true);
  snapshot = signal<string | null>(null);

  private readonly domainId: string;

  constructor() {
    super();
    const data = this.data;
    this.domainId = data.domainId;

    effect(() => {
      const envValue = this.environmentSelection.value;
      if (envValue) {
        this.data.environment = envValue;
      }
    });
    
    effect(() => {
      const compValue = this.componentSelection.value;
      if (compValue) {
        this.data.component = compValue;
      }
    });
  }

  ngOnInit() {
    this.environmentService.getEnvironmentsByDomainId(this.domainId)
      .subscribe(environments => {
        const filteredEnvironments = environments.filter(environment => 
          environment.name !== this.data.currentEnvironment);
        this.environments.set(filteredEnvironments);
      });
    
    this.componentService.getComponentsByDomain(this.domainId)
      .subscribe(components => {
        const componentsList = [{ name: '-' } as SwitcherComponent, ...components];
        this.components.set(componentsList);
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDownload() {
    const { valid } = this.environmentSelection;

    if (valid) {
      const component = this.componentSelection.value === '-' ? null : this.componentSelection.value;
      const environment = this.environmentSelection.value;
      
      this.setBlockUI(true, 'Downloading...');
      this.snapshot.set(null);
      this.domainService.executeSnapshotQuery(
        this.domainId, environment, component, this.includeStatus(), this.includeDescription())
        .subscribe({
          next: (result: any) => {
            if (result) {
              const omitTypename = (key: any, value: any) => key === '__typename' ? undefined : value;
              const snapshotData = JSON.stringify(JSON.parse(JSON.stringify(result.data), omitTypename), null, 2);
              this.snapshot.set(snapshotData);
              this.lockEnvSelection();
              this.toastService.showSuccess('Snapshot downloaded with success');
            }
            this.setBlockUI(false);
          },
          error: error => {
            ConsoleLogger.printError(error);
            this.setBlockUI(false);
          }
        });
    }      
  }

  onCopy() {
    this.snapshot.set(null);
    this.lockEnvSelection();
    this.toastService.showSuccess('Snapshot copied with success');
  }

  private lockEnvSelection(): void {
    if (this.snapshot()) {
      this.environmentSelection.disable({ onlySelf: true });
      this.componentSelection.disable({ onlySelf: true });
    } else {
      this.environmentSelection.enable({ onlySelf: true });
      this.componentSelection.enable({ onlySelf: true });
    }
  }

}