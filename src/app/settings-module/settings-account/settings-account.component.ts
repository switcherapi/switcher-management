import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { DomainService } from 'src/app/services/domain.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from 'src/app/_helpers/confirmation-dialog';
import { Router } from '@angular/router';
import { BasicComponent } from 'src/app/dashboard-module/domain-module/common/basic-component';
import { ToastService } from 'src/app/_helpers/toast.service';

@Component({
  selector: 'app-settings-account',
  templateUrl: './settings-account.component.html',
  styleUrls: [
    '../../dashboard-module/domain-module/common/css/detail.component.css',
    './settings-account.component.css'
  ],
  standalone: false
})
export class SettingsAccountComponent extends BasicComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly authService = inject(AuthService);
  private readonly domainService = inject(DomainService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly _modalService = inject(NgbModal);

  private readonly unsubscribe = new Subject<void>();

  accountForm: FormGroup;
  domains = 1;

  userEmail: string;
  userPlatform: string;
  profileAvatar: string;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.setBlockUI(true);

    this.accountForm = this.formBuilder.group({
      name: ['', Validators.required]
    });

    this.loadDomains();
    this.loadAdmin();
    this.setBlockUI(false);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onUpdate() {
    if (this.accountForm.invalid) {
      return;
    }

    this.setBlockUI(true);
    this.adminService.updateAdmin(this.accountFormControl.name.value)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.authService.setUserInfo('name', this.accountFormControl.name.value);
            this.toastService.showSuccess('Account updated successfully');
          }
          this.setBlockUI(false);
        },
        error: error => {
          this.toastService.showError('Failed to update account');
          ConsoleLogger.printError(error);
          this.setBlockUI(false);
        }
      });
  }

  onDelete() {
    const modalConfirmation = this._modalService.open(NgbdModalConfirmComponent);
    modalConfirmation.componentInstance.title = 'Deleting account';
    modalConfirmation.componentInstance.question = `Are you sure you want to delete this account?`;
    modalConfirmation.result.then((result) => {
      if (result) {
        this.adminService.deleteAdmin().pipe(takeUntil(this.unsubscribe))
        .subscribe({
          next: admin => {
            if (admin) {
              this.authService.logout(true);
              this.router.navigate(['/']);
            }
          },
          error: error => {
            this.toastService.showError('Failed to delete account');
            ConsoleLogger.printError(error);
          }
        });
      }
    });
  }

  getPlatformIcon(): string {
    if (this.userPlatform === 'Switcher API') {
      return "assets\\switcherapi_mark_grey.png";
    }

    if (this.userPlatform === 'GitHub') {
      return "assets\\github.svg";
    }

    return "assets\\bitbucket.svg";
  }

  private get accountFormControl() { 
    return this.accountForm.controls; 
  }

  private loadAdmin() {
    this.accountFormControl.name.setValue(this.authService.getUserInfo('name'));
    this.userEmail = this.authService.getUserInfo('email');
    this.userPlatform = this.authService.getUserInfo('platform');
    const avatar = this.authService.getUserInfo('avatar');
    this.profileAvatar = avatar || "assets\\switcherapi_mark_grey.png";
  }
  
  private loadDomains(): void {
    this.domainService.getDomains().pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.domains = data.length;
          }
        },
        error: error => {
          this.toastService.showError('Failed to load domains');
          ConsoleLogger.printError(error);
        }
      });
  }

}
