import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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

  domains = signal<Domain[]>([]);
  collabDomains = signal<Domain[]>([]);

  cardListContainerStyle = signal('card mt-4 loading');
  cardCollabListContainerStyle = signal('card mt-4 loading');
  loading = signal(false);
  loadingCollab = signal(false);
  error = signal('');
  errorCollab = signal('');

  ngOnInit() {
    this.loading.set(true);
    this.loadingCollab.set(true);
    this.error.set('');
    this.errorCollab.set('');
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
        this.loading.set(true);
        this.domainService.createDomain(result.name, result.description).subscribe({
          next: domain => {
            if (domain) {
              this.ngOnInit();
              this.toastService.showSuccess('Domain created with success');
            }
          },
          error: error => {
            this.loading.set(false);
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
          this.domains.set(data);
        }
      },
      error: (error) => {
        ConsoleLogger.printError(error);
        this.loading.set(false);
        this.error.set(this.errorHandler.doError(error));
      },
      complete: () => {
        if (!this.domains().length) {
          this.error.set('Failed to connect to Switcher API');
        }
        this.loading.set(false);
        this.cardListContainerStyle.set('card mt-4 ready');
      }
    });
  }

  private loadCollabDomain(): void {
    this.collabDomains.set([]);
    this.domainService.getDomainsCollab().pipe(takeUntil(this.unsubscribe)).subscribe({
      next: (data) => {
        if (data?.length) {
          this.collabDomains.set(data);
          this.cardCollabListContainerStyle.set('card mt-4 ready');
        }
      }, 
      error: (error) => {
        ConsoleLogger.printError(error);
        this.loadingCollab.set(false);
      },
      complete: () => {
        this.loadingCollab.set(false);
      }
    });
  }

}
