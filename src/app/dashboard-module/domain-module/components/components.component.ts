import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, takeUntil } from 'rxjs/operators';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { SwitcherComponent } from 'src/app/model/switcher-component';
import { AdminService } from 'src/app/services/admin.service';
import { ComponentService } from 'src/app/services/component.service';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';

@Component({
  selector: 'app-components',
  templateUrl: './components.component.html',
  styleUrls: [
    '../common/css/list.component.css',
    '../common/css/preview.component.css',
    './components.component.css'
  ]
})
export class ComponentsComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  @BlockUI() blockUI: NgBlockUI;

  components: SwitcherComponent[];

  compFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  updatable: boolean = false;
  removable: boolean = false;
  creatable: boolean = false;

  domainId: string;
  domainName: string;
  classStatus = "card mt-4 loading";
  loading = true;
  creating = false;
  error = '';
  fetch = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private domainRouteService: DomainRouteService,
    private adminService: AdminService,
    private compService: ComponentService,
    private errorHandler: RouterErrorHandler,
    private toastService: ToastService,
    private _modalService: NgbModal,
    public dialog: MatDialog
  ) {
    this.activatedRoute.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.fetch == undefined);
   }

  ngOnInit() {
    this.loadComponents();
    this.readPermissionToObject();
    this.updateRoute();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private loadComponents(): void {
    this.loading = true;
    this.classStatus = "card mt-4 loading";

    this.compService.getComponentsByDomain(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (components: SwitcherComponent[]) => {
          this.components = components;
        },
        error: (error: any) => {
          this.error = error;
          this.loading = false;
          this.error = this.errorHandler.doError(error);
        },
        complete: () => {
          this.loading = false;
          this.classStatus = "card mt-4 ready";
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE', 'UPDATE', 'DELETE'], 'COMPONENT')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          data.forEach(element => {
            if (element.action === 'UPDATE') {
              this.updatable = element.result === 'ok';
            } else if (element.action === 'DELETE') {
              this.removable = element.result === 'ok';
            } else if (element.action === 'CREATE') {
              this.creatable = element.result === 'ok';
            }
          });
        }
    });
  }

  createComponent() {
    const { valid } = this.compFormControl;

    if (valid) {
      const componentName = this.compFormControl.value;
      this.compFormControl.reset();
      this.creating = true;

      this.compService.createComponent(this.domainId, componentName)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: data => {
            if (data.component) {
              this.components.push(data.component);
              this.confirmKeyCreated(data.apiKey, data.component.name);
            }
          },
          error: error => {
            this.toastService.showError(error.error);
            ConsoleLogger.printError(error);
          },
          complete: () => {
            this.creating = false;
          }
        });
    } else {
      this.toastService.showError('Unable to create this Component');
    }
  }

  removeComponent(selectedEnvironment: SwitcherComponent) {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Component Removal';
    modalConfirmation.componentInstance.question = `Are you sure you want to remove ${selectedEnvironment.name}?`;
    modalConfirmation.result.then((result) => {
      if (result) {
        const component = this.components.filter(env => env.id === selectedEnvironment.id);

        this.compService.deleteComponent(selectedEnvironment.id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: env => {
            if (env) {
              this.components.splice(this.components.indexOf(component[0]), 1);
              this.toastService.showSuccess('Component removed with success');
            }
          },
          error: error => {
            ConsoleLogger.printError(error);
            this.toastService.showError('Unable to remove this Component');
          }
        });
      }
    })
  }

  editComponent(selectedComponent: SwitcherComponent): void {
    const dialogRef = this.dialog.open(ComponentEditDialogComponent, {
      width: '350px',
      data: {
        name: selectedComponent.name,
        id: selectedComponent.id
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe)).subscribe(componentChanged => {
      if (componentChanged) {
        const body = {
          name: componentChanged.name
        };

        this.compService.updateComponent(selectedComponent.id, body.name)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data) {
                selectedComponent.name = componentChanged.name;
                this.toastService.showSuccess(`Component updated with success`);
              }
            },
            error: error => {
              ConsoleLogger.printError(error);
              this.toastService.showError(`Unable to update component`);
            }
          });
      }
    });
  }

  generateApiKey(selectedComponent: SwitcherComponent) {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'API Key';
    modalConfirmation.componentInstance.question = 'Are you sure you want to generate a new key for this component?';
    modalConfirmation.result.then((result) => {
      if (result) {
        this.blockUI.start('Generating API Key...');
        this.compService.generateApiKey(selectedComponent.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data) {
                this.blockUI.stop();
                this.confirmKeyCreated(data.apiKey, selectedComponent.name);
              }
            },
            error: error => {
              this.blockUI.stop();
              this.toastService.showError(`Unable to generate an API Key`);
              ConsoleLogger.printError(error);
            }
          });
      }
    })
  }

  private confirmKeyCreated(apiKey: string, componentName: string): void {
    this.dialog.open(ComponentEditDialogComponent, {
      width: '400px',
      data: { apiKey, componentName }
    });
  }

  private updateRoute(): void {
    this.domainRouteService.updateView('Components', 3);

    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }

}

@Component({
  selector: 'component.edit-dialog',
  templateUrl: 'component.edit-dialog.html',
  styleUrls: [
    '../common/css/create.component.css',
    './components.component.css'
  ]
})
export class ComponentEditDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ComponentEditDialogComponent>,
    private toastService: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: SwitcherComponent) { }

  onSave(data: SwitcherComponent): void {
    this.dialogRef.close(data);
  }

  onCancel() {
    this.dialogRef.close();
  }

  copyKey() {
    this.toastService.showSuccess(`API Key copied with success`);
  }

}
