import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomainService } from '../services/domain.service';
import { Domain } from '../domain-module/model/domain';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ToastService } from 'src/app/_helpers/toast.service';
import { DomainCreateComponent } from '../domain-create/domain-create.component';
import { AdminService } from '../services/admin.service';
import { TeamService } from '../services/team.service';
import { Team } from '../domain-module/model/team';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';

@Component({
  selector: 'app-domain-list',
  templateUrl: './domain-list.component.html',
  styleUrls: ['./domain-list.component.css']
})
export class DomainListComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  domains: Domain[];
  collabDomains: Domain[] = [];
  loading = false;
  loadingCollab = false;
  error = '';
  errorCollab = '';

  constructor(
    private dialog: MatDialog,
    private adminService: AdminService,
    private teamService: TeamService,
    private domainService: DomainService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.loadingCollab = true;
    this.error = '';
    this.errorCollab = '';
    this.loadDomain();
    this.loadCollabDomain();

    setTimeout(() => {
      if (!this.domains) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
      this.loadingCollab = false;
    }, environment.timeout);
  }

  loadDomain(): void {
    this.domainService.getDomains().pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.domains = data;
      }
      this.loading = false;
    }, error => {
      ConsoleLogger.printError(error);
      this.loading = false;
    });
  }

  loadCollabDomain(): void {
    this.adminService.getAdminCollab().pipe(takeUntil(this.unsubscribe)).subscribe(domains => {
      if (domains.length) {
        domains.forEach(domain => {
          this.domainService.getDomain(domain).pipe(takeUntil(this.unsubscribe)).subscribe(data => {
            if (data) {
              this.collabDomains.push(data);
            }
            this.loadingCollab = false;
          }, error => {
            this.loadingCollab = false;
          });
        });
      }
    });
  }

  getTeamDomains(teams: Team[]): string[] {
    return teams.map(team => team.domain);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createDomain(): void {
    const dialogRef = this.dialog.open(DomainCreateComponent, {
      width: '400px',
      data: { name: '',  description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.domainService.createDomain(result.name, result.description).subscribe(data => {
          if (data) {
            this.confirmKeyCreated(data.apiKey, data.domain.name);
            this.ngOnInit();
          }
        }, error => {
          this.toastService.showError('Unable to create a new domain.');
          ConsoleLogger.printError(error);
        });
      }
    });
  }

  confirmKeyCreated(apiKey: string, domainName: string): void {
    this.dialog.open(DomainCreateComponent, {
      width: '400px',
      data: { apiKey, domainName }
    });
  }
}
