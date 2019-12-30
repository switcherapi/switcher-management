import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Strategy } from '../model/strategy';

@Component({
  selector: 'app-strategy-detail',
  templateUrl: './strategy-detail.component.html',
  styleUrls: ['./strategy-detail.component.css']
})
export class StrategyDetailComponent implements OnInit {
  @Input() strategy = new EventEmitter<Strategy>();

  constructor() { }

  ngOnInit() {
  }
  
}
