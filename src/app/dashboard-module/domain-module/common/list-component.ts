import { ViewChildren, QueryList, Output, EventEmitter, Directive, AfterViewInit, Input, inject, signal, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MatSelect } from '@angular/material/select';
import { MatSelectionListChange } from '@angular/material/list';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';
import { ActivatedRoute } from '@angular/router';
import { EnvironmentChangeEvent } from '../environment-config/environment-config.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Directive()
export class ListComponent implements AfterViewInit {
    protected readonly cdr = inject(ChangeDetectorRef, { optional: true });
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly formBuilder = inject(FormBuilder);
    private readonly envService = inject(EnvironmentService);

    protected unsubscribe = new Subject<void>();
    
    @ViewChildren('envSelectionChange')
    public component: QueryList<MatSelect>;
    private envSelectionChange: MatSelect;

    environmentSelection: FormGroup;

    @Input() environments: Environment[];
    @Input() childEnvironmentEmitter: EventEmitter<EnvironmentChangeEvent>;
    @Output() environmentSelectionChange = new EventEmitter<string>();

    cardListContainerStyle = signal('card mt-4 loading');
    domainId: string;
    domainName: string;
    groupId: string;

    skip = 0;
    loading = signal(false);
    error = signal('');

    constructor() {
        this.activatedRoute.parent.params.subscribe(params => {
            this.domainId = params.domainid;
            this.domainName = params.name;
        });

        this.activatedRoute.params.subscribe(params => {
            this.groupId = params.groupid;
        });
        
        this.loadOperationSelectionComponent();
    }

    loadOperationSelectionComponent(): void {
        this.environmentSelection = this.formBuilder.group({
            environmentSelection: [null, Validators.required]
        });
    }

    loadEnvironments(environmentName = 'default'): void {
        if (this.environments && this.environments.length > 0) {
            setTimeout(() => this.initEnvironmentComponent(environmentName), 100);
        } else {
            this.envService.getEnvironmentsByDomainId(this.domainId).subscribe(env => {
                this.environments = env;
                this.initEnvironmentComponent(environmentName);
                this.cdr?.detectChanges();
            });
        }
    }

    ngAfterViewInit(): void {
        this.onEnvironmentChange();
        this.component.changes.subscribe((comps: QueryList<MatSelect>) => {
            if (comps.first) {
                this.envSelectionChange = comps.first;
                this.envSelectionChange.selectionChange.subscribe((s: MatSelectionListChange) => {
                    this.onEnvChange({ environmentName: s.source._value.toString(), reloadPermissions: true });
                });
            }
        });
    }

    protected onEnvChange($event: EnvironmentChangeEvent) {
        this.environmentSelectionChange.emit($event.environmentName);
    }

    private setProductionFirst(environmentName = 'default'): string {
        const defaultEnv = this.environments.find(env => env.name === environmentName);

        if (defaultEnv) {
            return defaultEnv.name;
        }

        return this.environments[0].name;
    }

    private initEnvironmentComponent(environmentName: string): void {
        this.environmentSelection.get('environmentSelection').setValue(this.setProductionFirst(environmentName));
        this.environmentSelectionChange.emit(this.setProductionFirst(environmentName));
        this.cardListContainerStyle.set('card mt-4 ready');
        this.cdr?.detectChanges();
    }

    private onEnvironmentChange(): void {
        if (!this.childEnvironmentEmitter) {
          return;
        }
    
        this.childEnvironmentEmitter
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(data => this.onEnvChange(data));
      }
}