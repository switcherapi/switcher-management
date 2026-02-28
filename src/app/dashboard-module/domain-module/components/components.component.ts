import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map, takeUntil } from 'rxjs/operators';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { SwitcherComponent } from 'src/app/model/switcher-component';
import { AdminService } from 'src/app/services/admin.service';
import { ComponentService } from 'src/app/services/component.service';
import { ActivatedRoute } from '@angular/router';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { BasicComponent } from '../common/basic-component';
import { NgClass } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatInput, MatHint } from '@angular/material/input';
import { SpecialCharacterDirective } from '../common/special.char.directive';
import { MatToolbar } from '@angular/material/toolbar';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';

@Component({
    selector: 'app-components',
    templateUrl: './components.component.html',
    styleUrls: [
        '../common/css/list.component.css',
        '../common/css/preview.component.css',
        './components.component.css'
    ],
    imports: [NgClass, MatButton, MatIcon, MatProgressSpinner, MatFormField, MatLabel, 
      MatInput, FormsModule, SpecialCharacterDirective, ReactiveFormsModule
    ]
})
export class ComponentsComponent extends BasicComponent implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly domainRouteService = inject(DomainRouteService);
  private readonly adminService = inject(AdminService);
  private readonly compService = inject(ComponentService);
  private readonly errorHandler = inject(RouterErrorHandler);
  private readonly toastService = inject(ToastService);
  private readonly _modalService = inject(NgbModal);
  dialog = inject(MatDialog);

  private readonly unsubscribe = new Subject<void>();

  components = signal<SwitcherComponent[]>([]);
  filterText = signal<string>('');
  filteredComponents = computed(() => this.filterComponents());

  compFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  updatable = signal(false);
  removable = signal(false);
  creatable = signal(false);

  domainId: string;
  domainName: string;
  classStatus = signal('card mt-4 loading');
  loading = signal(true);
  creating = signal(false);
  error = signal('');
  fetch = true;

  constructor() {
    super();
    this.activatedRoute.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => globalThis.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.navigationId === 1);
   }

  ngOnInit() {
    this.loadComponents();
    this.readPermissionToObject();
    this.updateRoute();
    
    // Subscribe to form control changes for filtering
    this.compFormControl.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(value => this.filterText.set(value || ''));
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private loadComponents(): void {
    this.loading.set(true);
    this.classStatus.set('card mt-4 loading');

    this.compService.getComponentsByDomain(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: (components: SwitcherComponent[]) => {
          this.components.set(components);
        },
        error: (error: any) => {
          this.error.set(this.errorHandler.doError(error));
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
          this.classStatus.set('card mt-4 ready');
        }
      });
  }

  private readPermissionToObject(): void {
    this.adminService.readCollabPermission(this.domainId, ['CREATE', 'UPDATE', 'DELETE'], 'COMPONENT')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        if (data.length) {
          for (const element of data) {
            if (element.action === 'UPDATE') {
              this.updatable.set(element.result === 'ok');
            } else if (element.action === 'DELETE') {
              this.removable.set(element.result === 'ok');
            } else if (element.action === 'CREATE') {
              this.creatable.set(element.result === 'ok');
            }
          }
        }
    });
  }

  private filterComponents(): SwitcherComponent[] {
    const filter = this.filterText().toLowerCase().trim();

    if (!filter) {
      return this.components();
    }

    return this.components().filter(component => 
      component.name.toLowerCase().includes(filter)
    );
  }

  createComponent() {
    const { valid } = this.compFormControl;

    if (valid) {
      const componentName = this.compFormControl.value;
      this.compFormControl.reset();
      this.creating.set(true);

      this.compService.createComponent(this.domainId, componentName)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: data => {
            if (data.component) {
              const currentComponents = this.components();
              this.components.set([...currentComponents, data.component]);
              this.confirmKeyCreated(data.apiKey, data.component.name);
            }
          },
          error: error => {
            this.creating.set(false);
            this.toastService.showError(error.error);
            ConsoleLogger.printError(error);
          },
          complete: () => {
            this.creating.set(false);
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
        const currentComponents = this.components();
        const component = currentComponents.find(env => env.id === selectedEnvironment.id);

        this.compService.deleteComponent(selectedEnvironment.id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: env => {
            if (env && component) {
              const updatedComponents = currentComponents.filter(c => c.id !== selectedEnvironment.id);
              this.components.set(updatedComponents);
              this.toastService.showSuccess('Component removed with success');
            }
          },
          error: error => {
            ConsoleLogger.printError(error);
            this.toastService.showError('Unable to remove this Component');
          }
        });
      }
    });
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
                const currentComponents = this.components();
                const updatedComponents = currentComponents.map(comp => 
                  comp.id === selectedComponent.id 
                    ? { ...comp, name: componentChanged.name }
                    : comp
                );
                this.components.set(updatedComponents);
                this.toastService.showSuccess('Component updated with success');
              }
            },
            error: error => {
              ConsoleLogger.printError(error);
              this.toastService.showError('Unable to update component');
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
        this.setBlockUI(true, 'Generating API Key...');
        this.compService.generateApiKey(selectedComponent.id)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe({
            next: data => {
              if (data) {
                this.setBlockUI(false);
                this.confirmKeyCreated(data.apiKey, selectedComponent.name);
              }
            },
            error: error => {
              this.setBlockUI(false);
              this.toastService.showError('Unable to generate an API Key');
              ConsoleLogger.printError(error);
            }
          });
      }
    });
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
    } else {
      this.domainRouteService.refreshPath();
    }
  }

}

@Component({
    selector: 'app-component.edit-dialog',
    templateUrl: 'component.edit-dialog.html',
    styleUrls: [
        '../common/css/create.component.css',
        './components.component.css'
    ],
    imports: [MatDialogTitle, MatToolbar, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, MatFormField, MatInput, 
      FormsModule, SpecialCharacterDirective, MatLabel, MatHint, MatDialogActions, MatButton, CdkCopyToClipboard
    ]
})
export class ComponentEditDialogComponent {
  dialogRef = inject<MatDialogRef<ComponentEditDialogComponent>>(MatDialogRef);
  private readonly toastService = inject(ToastService);
  data = inject<SwitcherComponent>(MAT_DIALOG_DATA);

  onSave(data: SwitcherComponent): void {
    this.dialogRef.close(data);
  }

  onCancel() {
    this.dialogRef.close();
  }

  copyKey() {
    this.toastService.showSuccess('API Key copied with success');
  }

}
