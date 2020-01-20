import { ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';

import { MatSelect } from '@angular/material';

import { FormGroup } from '@angular/forms';

import { Environment } from '../model/environment';

import { AdminService } from '../../services/admin.service';

export class ListComponent {
    @ViewChildren("envSelectionChange")
    public component: QueryList<MatSelect>
    private envSelectionChange: MatSelect;

    environmentSelection: FormGroup;
  
    environments: Environment[];
    @Output() environmentSelectionChange: EventEmitter<string> = new EventEmitter();

    constructor(
        private service: AdminService,
      ) { }


}