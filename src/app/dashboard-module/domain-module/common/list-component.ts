import { ViewChildren, QueryList, Output, EventEmitter, Directive, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MatSelect } from '@angular/material/select';
import { MatSelectionListChange } from '@angular/material/list';
import { Environment } from 'src/app/model/environment';
import { EnvironmentService } from 'src/app/services/environment.service';
import { ActivatedRoute } from '@angular/router';

@Directive()
export class ListComponent implements AfterViewInit {
    @ViewChildren("envSelectionChange")
    public component: QueryList<MatSelect>
    private envSelectionChange: MatSelect;

    environmentSelection: FormGroup;

    environments: Environment[];
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
        this.envService.getEnvironmentsByDomainId(this.domainId).subscribe(env => {
            this.environments = env;
            this.environmentSelection.get('environmentSelection').setValue(this.setProductionFirst());
            this.environmentSelectionChange.emit(this.setProductionFirst());
            this.cardListContainerStyle = 'card mt-4 ready';
        });
    }

    ngAfterViewInit(): void {
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
}