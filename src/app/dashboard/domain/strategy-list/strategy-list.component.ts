import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Strategy } from '../model/strategy';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-strategy-list',
  templateUrl: './strategy-list.component.html',
  styleUrls: ['./strategy-list.component.css']
})
export class StrategyListComponent implements OnInit {
  @Input() strategies = new EventEmitter<Strategy[]>();

  constructor() { }

  ngOnInit() {
  }

}
