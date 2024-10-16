import { OnDestroy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { DomainRouteService } from 'src/app/services/domain-route.service';
import { Types } from 'src/app/model/path-route';
import { FeatureService } from 'src/app/services/feature.service';
import { GitOpsService } from 'src/app/services/gitops.service';
import { buildNewGitOpsAccount, GitOpsAccount } from 'src/app/model/gitops';
import { MatDialog } from '@angular/material/dialog';
import { GitOpsEnvSelectionComponent } from './gitops-env-selection/gitops-env-selection.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { GitOpsUpdateTokensComponent } from './gitops-update-tokens/gitops-update-tokens.component';

@Component({
  selector: 'app-ext-gitops',
  templateUrl: './ext-gitops.component.html',
  styleUrls: [
    '../common/css/detail.component.css', 
    './ext-gitops.component.css'
  ]
})
export class ExtGitOpsComponent implements OnInit, OnDestroy {
  private readonly unsubscribe = new Subject<void>();
  detailBodyStyle = 'detail-body loading';

  formGroup: FormGroup;

  gitOpsAccounts: GitOpsAccount[] = [];
  gitOpsSelected: GitOpsAccount;
  domainId: string;
  domainName: string;
  loading = true;
  featureFlag = false;
  fetch = true;
  allowUpdate = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly featureService: FeatureService,
    private readonly gitOpsService: GitOpsService,
    private readonly adminService: AdminService,
    private readonly domainRouteService: DomainRouteService,
    private readonly dialog: MatDialog,
    private readonly fb: FormBuilder
  ) { 
    this.activatedRoute.parent.params.subscribe(params => {
      this.domainId = params.domainid;
      this.domainName = decodeURIComponent(params.name);
    });

    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => this.fetch = data.navigationId === 1);
  }

  ngOnInit(): void {
    this.domainRouteService.updateView(this.domainName, 0);
    this.formInit();
    this.loadPermissions();
    this.updateRoute();
    this.readFeatureFlag();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  onStartNewAccount(): void {
    const dialogRef = this.dialog.open(GitOpsEnvSelectionComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { 
        excludeEnvironments: this.gitOpsAccounts
          .filter(account => account.ID)
          .map(account => account.environment),
        domainId: this.domainId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.gitOpsAccounts = this.gitOpsAccounts.filter(account => account.ID);
      if (this.gitOpsAccounts.length > 0) {
        this.selectAccount(this.gitOpsAccounts[0]);
      }

      if (result) {
        const account = buildNewGitOpsAccount(result.environment, this.domainId, this.domainName);
        this.gitOpsAccounts.push(account);
        this.selectAccount(account);
      }
    });
  }

  onUpdateTokens(): void {
    const dialogRef = this.dialog.open(GitOpsUpdateTokensComponent, {
      width: '400px',
      minWidth: window.innerWidth < 450 ? '95vw' : '',
      data: { 
        environments: this.gitOpsAccounts
          .filter(account => account.ID)
          .map(account => account.environment)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('result', result);
      }
    });
  }

  getDomainEnvironments(): string[] {
    return this.gitOpsAccounts.map(account => account.environment);
  }

  private formInit(): void {
    this.formGroup = this.fb.group({
      environment: new FormControl('')
    });

    this.formGroup.get('environment').valueChanges.subscribe(value => {
      this.gitOpsSelected = this.gitOpsAccounts.find(account => account.environment === value);
    });
  }

  private readFeatureFlag(): void {
    this.featureService.isEnabled({ 
      feature: 'GITOPS_INTEGRATION', 
      parameters: {
        value: this.domainId
      }
    }).subscribe({
      next: data => {
        this.featureFlag = data.status;
        this.loadAccounts();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadAccounts(): void {
    this.gitOpsService.findGitOpsAccounts(this.domainId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: data => {
          this.gitOpsAccounts = data;
          this.selectAccount(this.gitOpsAccounts[0]);

          this.loading = false;
          this.detailBodyStyle = 'detail-body ready'
        },
        error: () => {
          this.loading = false;
          this.detailBodyStyle = 'detail-body ready'
        }
      });
  }

  private loadPermissions(): void {
    this.adminService.readCollabPermission(this.domainId, ['UPDATE'], 'ADMIN')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        data.forEach(perm => {
          if (perm.action === 'UPDATE') {
            this.allowUpdate = perm.result === 'ok';
          }
        });
      }
    );
  }

  private updateRoute(): void {
    if (this.fetch) {
      this.domainRouteService.updatePath(this.domainId, this.domainName, Types.DOMAIN_TYPE, 
        `/dashboard/domain/${this.domainName}/${this.domainId}`);
    }
  }

  private selectAccount(account: GitOpsAccount): void {
    this.gitOpsSelected = account;
    this.formGroup.get('environment').setValue(account.environment);
  }
  
}