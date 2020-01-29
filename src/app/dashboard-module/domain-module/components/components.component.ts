import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { DomainRouteService } from '../../services/domain-route.service';
import { ToastService } from 'src/app/_helpers/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Types } from '../model/path-route';
import { takeUntil } from 'rxjs/operators';
import { NgbdModalConfirm } from 'src/app/_helpers/confirmation-dialog';
import { ComponentService } from '../../services/component.service';
import { SwitcherComponent } from '../model/switcher-component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

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

  components: SwitcherComponent[];

  compFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  constructor(
    private compService: ComponentService,
    private domainRouteService: DomainRouteService,
    private toastService: ToastService,
    private _modalService: NgbModal,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loadComponents();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadComponents(): void {
    this.compService.getComponentsByDomain(this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(components => {
        this.components = components;
    });
  }

  createComponent() {
    const { valid } = this.compFormControl;

    if (valid) {
      this.compService.createComponent(
        this.domainRouteService.getPathElement(Types.SELECTED_DOMAIN).id, this.compFormControl.value, 'Created using Switcher Manager')
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(component => {
          if (component) {
            this.components.push(component);
            this.toastService.showSuccess('Component created with success');
          }
        }, error => {
          this.toastService.showError(error.error);
        });
    } else {
      this.toastService.showError('Unable to create this Component');
    }
  }

  removeComponent(selectedEnvironment: SwitcherComponent) {
    const modalConfirmation = this._modalService.open(NgbdModalConfirm);
    modalConfirmation.componentInstance.title = 'Component Removal';
    modalConfirmation.componentInstance.question = `Are you sure you want to remove ${selectedEnvironment.name}?`;
    modalConfirmation.result.then((result) => {
      if (result) {
        const component = this.components.filter(env => env.id === selectedEnvironment.id);

        this.compService.deleteComponent(selectedEnvironment.id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(env => {
          if (env) {
            this.components.splice(this.components.indexOf(component[0]), 1);
            this.toastService.showSuccess('Component removed with success');
          }
        }, error => {
          console.log(error);
          this.toastService.showError('Unable to remove this Component');
        });
      }
    })
  }

  editComponent(selectedComponent: SwitcherComponent): void {
    const dialogRef = this.dialog.open(ComponentEditDialog, {
      width: '250px',
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

        this.compService.updateComponent(selectedComponent.id, body.name).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
          if (data) {
            selectedComponent.name = componentChanged.name;
            this.toastService.showSuccess(`Component updated with success`);
          }
        }, error => {
          console.log(error)
          this.toastService.showError(`Unable to update component`);
        });
      }
    });
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
export class ComponentEditDialog {

  constructor(
    public dialogRef: MatDialogRef<ComponentEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: SwitcherComponent) { }

  onSave(data: SwitcherComponent): void {
    this.dialogRef.close(data);
  }

  onCancel() {
    this.dialogRef.close();
  }

}
