import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomainService } from '../services/domain.service';
import { Domain } from '../domain-module/model/domain';
import { environment } from 'src/environments/environment';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { ToastService } from 'src/app/_helpers/toast.service';
import { DomainCreateComponent } from '../domain-create/domain-create.component';

@Component({
  selector: 'app-domain-list',
  templateUrl: './domain-list.component.html',
  styleUrls: ['./domain-list.component.css']
})
export class DomainListComponent implements OnInit, OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  domains$: Domain[];
  loading = false;
  error = '';

  constructor(
    private dialog: MatDialog,
    private domainService: DomainService,
    private errorHandler: RouterErrorHandler,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.error = '';
    this.domainService.getDomains().pipe(takeUntil(this.unsubscribe)).subscribe(data => {
      if (data) {
        this.domains$ = data;
      }
      this.loading = false;
    }, error => {
      this.error = this.errorHandler.doError(error);
      this.loading = false;
    });

    setTimeout(() => {
      if (!this.domains$) {
        this.error = 'Failed to connect to Switcher API';
      }
      this.loading = false;
    }, environment.timeout);
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
          console.log(error);
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
