import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { PermissionService } from 'src/app/services/permission.service';
import { Permission } from 'src/app/model/permission';
import { EnvironmentService } from 'src/app/services/environment.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatCard, MatCardHeader, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { MatSelectionList, MatListOption } from '@angular/material/list';

@Component({
    selector: 'app-team-permission-create',
    templateUrl: './team-permission-create.component.html',
    styleUrls: [
        '../../common/css/detail.component.css',
        '../../common/css/create.component.css',
        './team-permission-create.component.css'
    ],
    imports: [MatDialogTitle, MatToolbar, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, 
      MatLabel, MatSelect, MatOption, MatSelectTrigger, MatCard, MatCardHeader, MatCardSubtitle, MatCardContent, MatSelectionList, 
      MatListOption, MatInput, MatButton, MatDialogActions
    ]
})
export class TeamPermissionCreateComponent implements OnInit, OnDestroy {
  dialogRef = inject<MatDialogRef<TeamPermissionCreateComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  private readonly permissionService = inject(PermissionService);
  private readonly environmentService = inject(EnvironmentService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  private readonly unsubscribe = new Subject<void>();

  routers: string[] = [];
  actions: string[] = [];
  environments: string[] = [];
  key: string;
  validKeyOnly: boolean;

  strategySelected: string;

  elementCreationFormGroup: FormGroup;

  routerFormControl = new FormControl('', [
    Validators.required
  ]);

  actionFormControl = new FormControl('', [
    Validators.required
  ]);

  environmentFormControl = new FormControl('', []);
  
  valueSelectionFormControl = new FormControl('', [
    Validators.required
  ]);

  ngOnInit() {
    this.loadRouter();
    this.loadActions();
    this.loadEnvironments();

    this.elementCreationFormGroup = this.formBuilder.group({
      routerFormControl: this.routerFormControl,
      actionFormControl: this.actionFormControl,
      environmentFormControl: this.environmentFormControl,
    });

    this.onRouterChange();
    this.onActionChange();
    this.onEnvironmentsChange();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  addValue(newValue: string) {
    const { valid } = this.valueSelectionFormControl;
    if (valid) {
      if (this.data.values && !this.data.values.includes(newValue)) {
        this.data.values.push(newValue);
      } else {
        this.data.values = [newValue];
      }
    }
  }

  removeValue(value: string) {
    this.data.values.splice(this.data.values.indexOf(value), 1);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(data: any) {
    const { valid } = this.elementCreationFormGroup;

    if (valid && this.validateData(data)) {
      this.loadIdentifiedBy();
      this.dialogRef.close(data);
    }      
  }

  private loadRouter(): void {
    this.permissionService.getPermissionRouters()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: routers => {
          if (routers) {
            this.routers = routers.routersAvailable;
            if (this.data.router) {
              this.routerFormControl.setValue(this.data.router);
            }
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        }
      });
  }

  private loadActions(): void {
    this.permissionService.getPermissionActions()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: actions => {
          if (actions) {
            this.actions = actions.actionsAvailable;
            if (this.data.action) {
              this.actionFormControl.setValue(this.data.action);
            }
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        }
      });
  }

  private loadEnvironments() {
    this.environmentService.getEnvironmentsByDomainId(this.data.domain)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: environments => {
          if (environments) {
            this.environments = environments.map(environment => environment.name);
            if (this.data.environments) {
              this.environmentFormControl.setValue(this.data.environments);
            }
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        }
      });
  }

  private validateData(data: any): boolean {
    // When editing
    if (this.data.permission) {
      return true;
    }

    const foundPermission = this.data.permissions.filter((permission: Permission) => 
      permission.router === data.router || permission.router === 'ALL' || permission.router === 'ALL');

    const foundPermissionAction = foundPermission.filter((permission: Permission) => 
      permission.action === data.action || permission.action === 'ALL');

    if (foundPermissionAction.length) {
      this.toastService.showError(`This permission has conflicted with an existing permission: ${foundPermissionAction[0].router} - ${foundPermissionAction[0].action}`);
      return false;
    }

    return true;
  }

  private loadIdentifiedBy(): void {
    if (this.data.values.length) {
      this.data.identifiedBy = this.key;
    } else {
      this.data.identifiedBy = '';
      this.data.values = [];
    }
  }
  
  private onRouterChange() {
    this.routerFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.router = value;
      this.permissionService.getKeysByRouter(value).pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: permissionValue => {
            this.key = permissionValue.key;
            this.validKeyOnly = permissionValue?.key;
          },
          error: error => {
            ConsoleLogger.printError(error);
            this.validKeyOnly = false;
            this.valueSelectionFormControl.setValue(null);
            this.data.values = [];
          }
        });
    });
  }

  private onActionChange() {
    this.actionFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.action = value;
    });
  }

  private onEnvironmentsChange() {
    this.environmentFormControl.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(value => {
      this.data.environments = value;
    });
  }

}
