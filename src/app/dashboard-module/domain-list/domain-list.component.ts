import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService } from 'src/app/_helpers/toast.service';
import { DomainCreateComponent } from '../domain-create/domain-create.component';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { RouterErrorHandler } from 'src/app/_helpers/router-error-handler';
import { MatDialog } from '@angular/material/dialog';
import { DomainService } from 'src/app/services/domain.service';
import { Domain } from 'src/app/model/domain';
import { NgClass } from '@angular/common';
import { ToastsContainerComponent } from '../../_helpers/toasts-container.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DomainPreviewComponent } from '../domain-preview/domain-preview.component';

@Component({
    selector: 'app-domain-list',
    templateUrl: './domain-list.component.html',
    styleUrls: [
        './domain-list.component.css',
        '../domain-module/common/css/list.component.css'
    ],
    imports: [NgClass, ToastsContainerComponent, MatButton, MatIcon, DomainPreviewComponent]
})
export class DomainListComponent implements OnInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  private readonly domainService = inject(DomainService);
  private readonly toastService = inject(ToastService);
  private readonly errorHandler = inject(RouterErrorHandler);

  private readonly unsubscribe = new Subject<void>();

  domains: Domain[];
  collabDomains: Domain[] = [];

  cardListContainerStyle = 'card mt-4 loading';
  cardCollabListContainerStyle = 'card mt-4 loading';
  loading = false;
  loadingCollab = false;
  error = '';
  errorCollab = '';

  ngOnInit() {
    this.loading = true;
    this.loadingCollab = true;
    this.error = '';
    this.errorCollab = '';
    this.loadDomain();
    this.loadCollabDomain();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  createDomain(): void {
    const dialogRef = this.dialog.open(DomainCreateComponent, {
      width: '400px',
      minWidth: globalThis.innerWidth < 450 ? '95vw' : '',
      data: { name: '',  description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.domainService.createDomain(result.name, result.description).subscribe({
          next: domain => {
            if (domain) {
              this.ngOnInit();
              this.toastService.showSuccess('Domain created with success');
            }
          },
          error: error => {
            this.loading = false;
            this.toastService.showError(`Unable to create a new domain. ${error.error}`);
            ConsoleLogger.printError(error);
          }
        });
      }
    });
  }
  
  private loadDomain(): void {
    this.domainService.getDomains().pipe(takeUntil(this.unsubscribe)).subscribe({
      next: (data) => {
        if (data) {
          this.domains = data;
        }
      },
      error: (error) => {
        ConsoleLogger.printError(error);
        this.loading = false;
        this.error = this.errorHandler.doError(error);
      },
      complete: () => {
        if (!this.domains) {
          this.error = 'Failed to connect to Switcher API';
        }
        this.loading = false;
        this.cardListContainerStyle = 'card mt-4 ready';
      }
    });
  }

  private loadCollabDomain(): void {
    this.collabDomains = [];
    this.domainService.getDomainsCollab().pipe(takeUntil(this.unsubscribe)).subscribe({
      next: (data) => {
        if (data?.length) {
          this.collabDomains = data;
          this.cardCollabListContainerStyle = 'card mt-4 ready';
        }
      }, 
      error: (error) => {
        ConsoleLogger.printError(error);
        this.loadingCollab = false;
      },
      complete: () => {
        this.loadingCollab = false;
      }
    });
  }

}
