import { ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { MatSelect, MatSelectionListChange } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Environment } from '../model/environment';

import { EnvironmentService } from '../../services/environment.service';
import { DomainRouteService } from '../../services/domain-route.service';
import { Types } from '../model/path-route';

export class ListComponent {
    @ViewChildren("envSelectionChange")
    public component: QueryList<MatSelect>
    private envSelectionChange: MatSelect;

    environmentSelection: FormGroup;

    environments: Environment[];
    @Output() environmentSelectionChange: EventEmitter<string> = new EventEmitter();

    cardListContainerStyle: string = 'card mt-4 loading';

    constructor(
        private formBuilder: FormBuilder,
        private envService: EnvironmentService,
        private drService: DomainRouteService
    ) {
        this.loadOperationSelectionComponent();
    }

    loadOperationSelectionComponent(): void {
        this.environmentSelection = this.formBuilder.group({
            environmentSelection: [null, Validators.required]
        });
    }

    loadEnvironments(): void {
        this.envService.getEnvironmentsByDomainId(this.drService.getPathElement(Types.SELECTED_DOMAIN).id).subscribe(env => {
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