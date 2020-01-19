import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Strategy } from '../../model/strategy';
import { MatSelectionList, MatSelectionListChange } from '@angular/material';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

export interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-strategy-detail',
  templateUrl: './strategy-detail.component.html',
  styleUrls: ['./strategy-detail.component.css']
})
export class StrategyDetailComponent implements OnInit {
  @Input() strategy: Strategy;
  viewValues: boolean;

  @ViewChild(MatSelectionList, { static: true })
  private strategyValueSelection: MatSelectionList;

  operationCategory: FormGroup;
  strategyOperations: string[] = ['EXIST', 'NOT_EXIST', 'EQUAL', 'NOT_EQUAL', 'GREATER', 'LOWER', 'BETWEEN'];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.strategyValueSelection.selectionChange.subscribe((s: MatSelectionListChange) => {
      this.strategyValueSelection.deselectAll();
      s.option.selected = true;
    });

    this.operationCategory = this.fb.group({
      operationCategory: [null, Validators.required]
    });
    
    const toSelect = this.strategyOperations.find(operation => operation === this.strategy.operation);
    this.operationCategory.get('operationCategory').setValue(toSelect);
  }

}
