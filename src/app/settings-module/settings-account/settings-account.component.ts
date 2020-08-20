import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AdminService } from 'src/app/services/admin.service';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

@Component({
  selector: 'app-settings-account',
  templateUrl: './settings-account.component.html',
  styleUrls: [
    '../../dashboard-module/domain-module/common/css/detail.component.css',
    './settings-account.component.css']
})
export class SettingsAccountComponent implements OnInit, OnDestroy {

  private unsubscribe: Subject<void> = new Subject();
  @BlockUI() blockUI: NgBlockUI;

  accountForm: FormGroup;
  resetSuccess: string;
  error: string = '';

  userEmail: string;
  userPlatform: string;
  profileAvatar: string;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.blockUI.start('Loading...');

    this.accountForm = this.formBuilder.group({
      name: ['', Validators.required]
    });

    this.loadAdmin();
    this.blockUI.stop();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadAdmin() {
    this.f.name.setValue(this.authService.getUserInfo('name'));
    this.userEmail = this.authService.getUserInfo('email');
    this.userPlatform = this.authService.getUserInfo('platform');
    const avatar = this.authService.getUserInfo('avatar');
    this.profileAvatar = avatar || "assets//switcherapi_mark_white.png";
  }

  onUpdate() {
    if (this.accountForm.invalid) {
      return;
    }

    this.blockUI.start('Loading...');
    this.adminService.updateAdmin(this.f.name.value)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
      if (data) {
        this.authService.setUserInfo('name', this.f.name.value);
          this.resetSuccess = 'Account updated with success';
      }
      this.blockUI.stop();
    }, error => {
      ConsoleLogger.printError(error);
      this.error = error;
      this.blockUI.stop();
    });
  }

  onSendResetPassord() {
    this.adminService.requestPasswordReset(this.userEmail)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
      if (data) {
          this.resetSuccess = 'Password reset successfully sent';
      }
    }, error => {
      ConsoleLogger.printError(error);
      this.error = error;
    });
  }

  onKey(event: any) {
    this.error = '';
    this.resetSuccess = '';
  }

  getPlatformIcon(): string {
    return this.userPlatform === 'Switcher API' ? 
      "assets\\switcherapi_mark_grey.png" :
      this.userPlatform === 'GitHub' ?
        "assets\\github.svg" :
        "assets\\bitbucket.svg";
  }

  get f() { return this.accountForm.controls; }

}
