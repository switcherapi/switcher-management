import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { Environment } from '../../model/environment';
import { EnvironmentService } from 'src/app/dashboard-module/services/environment.service';
import { DomainRouteService } from 'src/app/dashboard-module/services/domain-route.service';
import { Types } from '../../model/path-route';
import { takeUntil } from 'rxjs/operators';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

const STATUS_BY_ENV = `
  statusByEnv {
    env
    value
  }
`;

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

  environmentSelection = new FormControl('', [
    Validators.required
  ]);

  environments: Environment[];

  private domainId: string;
  private query: QueryRef<any>;

  includeStatus: boolean = true;
  includeDescription: boolean = true;
  snapshot: string;

  constructor(
    public dialogRef: MatDialogRef<DomainSnapshotComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private environmentService: EnvironmentService,
    private domainRouteService: DomainRouteService,
    private toastService: ToastService,
    private apollo: Apollo) { }

  ngOnInit() {
    this.domainId = this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id;
    this.environmentService.getEnvironmentsByDomainId(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(env => {
        this.environments = env;
        this.environments = this.environments.filter(environment => environment.name !== this.data.currentEnvironment);
        this.environmentSelection.setValue('default');
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

  onDownload() {
    const { valid } = this.environmentSelection;

    if (valid) {
      this.blockUI.start('Downloading...');
      this.snapshot = null;
      this.query = this.apollo.watchQuery({
        query: this.generateGql(this.includeStatus, this.includeDescription),
        variables: { 
          id: this.domainId,
          environment: this.environmentSelection.value
        }
      });

      this.query.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(result => {
        if (result) {
          const omitTypename = (key: any, value: any) => key === "__typename" ? undefined : value;
          this.snapshot = JSON.stringify(JSON.parse(JSON.stringify(result.data), omitTypename), null, 2);
          this.lockEnvSelection();
          this.toastService.showSuccess(`Snapshot downloaded with success`);
        }
        this.blockUI.stop();
      }, error => {
        ConsoleLogger.printError(error);
        this.blockUI.stop();
      });
    }      
  }

  onCopy() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.snapshot;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.snapshot = null;
    this.lockEnvSelection();
    this.toastService.showSuccess(`Snapshot copied with success`);
  }

  lockEnvSelection(): void {
    if (this.snapshot) {
      this.environmentSelection.disable({ onlySelf: true });
    } else {
      this.environmentSelection.enable({ onlySelf: true });
    }
  }

  generateGql(includeStatusByEnv: boolean = true, includeDescription: boolean = true): any {
    return gql`
      query domain($id: String!, $environment: String!) {
        domain(_id: $id, environment: $environment) {
          name
          version
          ${includeDescription ? 'description' : ''}
          ${includeStatusByEnv ? STATUS_BY_ENV : ''}
          activated
          group {
            name
            ${includeDescription ? 'description' : ''}
            activated
            ${includeStatusByEnv ? STATUS_BY_ENV : ''}
            config {
              key
              ${includeDescription ? 'description' : ''}
              activated
              ${includeStatusByEnv ? STATUS_BY_ENV : ''}
              strategies {
                strategy
                activated
                ${includeStatusByEnv ? STATUS_BY_ENV : ''}
                operation
                values
              }
            }
          }
        }
      }
  `;
  }

}