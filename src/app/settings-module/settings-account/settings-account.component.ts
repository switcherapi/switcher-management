import { Component, OnInit, OnDestroy } from '@angular/core';
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
  private readonly unsubscribe = new Subject<void>();

  accountForm: FormGroup;
  resetSuccess: string;
  error = '';
  domains = 1;

  userEmail: string;
  userPlatform: string;
  profileAvatar: string;

  constructor(
    private readonly router: Router,
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
    private readonly domainService: DomainService,
    private readonly formBuilder: FormBuilder,
    private readonly _modalService: NgbModal) {
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
    this.adminService.updateAdmin(this.f.name.value)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.authService.setUserInfo('name', this.f.name.value);
            this.resetSuccess = 'Account updated with success';
          }
          this.setBlockUI(false);
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error = error;
          this.setBlockUI(false);
        }
      });
  }

  onSendResetPassord() {
    this.adminService.requestPasswordReset(this.userEmail)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          if (data) {
            this.resetSuccess = 'Password reset successfully sent';
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
          this.error = error;
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
            ConsoleLogger.printError(error);
            this.error = error;
          }
        });
      }
    });
  }

  onKey(_event: any) {
    this.error = '';
    this.resetSuccess = '';
  }

  getPlatformIcon(): string {
    if (this.userPlatform === 'Switcher API')
      return "assets\\switcherapi_mark_grey.png";

    if (this.userPlatform === 'GitHub')
      return "assets\\github.svg";

    return "assets\\bitbucket.svg";
  }

  get f() { return this.accountForm.controls; }

  private loadAdmin() {
    this.f.name.setValue(this.authService.getUserInfo('name'));
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
          ConsoleLogger.printError(error);
          this.error = error;
        }
      });
  }

}
