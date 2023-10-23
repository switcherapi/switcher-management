import { ViewChildren, QueryList, Output, EventEmitter, Directive, AfterViewInit, Input } from '@angular/core';
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
    protected unsubscribe: Subject<void> = new Subject();
    
    @ViewChildren("envSelectionChange")
    public component: QueryList<MatSelect>
    private envSelectionChange: MatSelect;

    environmentSelection: FormGroup;

    @Input() environments: Environment[];
    @Input() childEnvironmentEmitter: EventEmitter<EnvironmentChangeEvent>;
    @Output() environmentSelectionChange: EventEmitter<string> = new EventEmitter();

    cardListContainerStyle: string = 'card mt-4 loading';
    domainId: string;
    domainName: string;
    groupId: string;

    constructor(
        private activatedRoute: ActivatedRoute,
        private formBuilder: FormBuilder,
        private envService: EnvironmentService
    ) {
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

    loadEnvironments(): void {
        if (this.environments) {
            setTimeout(() => this.initEnvironmentComponent(), 100);
        } else {
            this.envService.getEnvironmentsByDomainId(this.domainId).subscribe(env => {
                this.environments = env;
                this.initEnvironmentComponent();
            });
        }
    }

    ngAfterViewInit(): void {
        this.onEnvironmentChange();
        this.component.changes.subscribe((comps: QueryList<MatSelect>) => {
            if (comps.first) {
                this.envSelectionChange = comps.first;
                this.envSelectionChange.selectionChange.subscribe((s: MatSelectionListChange) => {
                    this.environmentSelectionChange.emit(s.source._value.toString());
                });
            }
        });
    }

    setProductionFirst(): string {
        const defaultEnv = this.environments.find(env => env.name === 'default');

        if (defaultEnv) {
            return defaultEnv.name;
        }

        return this.environments[0].name;
    }

    private initEnvironmentComponent(): void {
        this.environmentSelection.get('environmentSelection').setValue(this.setProductionFirst());
        this.environmentSelectionChange.emit(this.setProductionFirst());
        this.cardListContainerStyle = 'card mt-4 ready';
    }

    private onEnvironmentChange(): void {
        if (!this.childEnvironmentEmitter) {
          return;
        }
    
        this.childEnvironmentEmitter
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(data => this.environmentSelectionChange.emit(data.environmentName));
      }
}