import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Strategy } from '../../model/strategy';

@Component({
  selector: 'app-strategy-list',
  templateUrl: './strategy-list.component.html',
  styleUrls: ['./strategy-list.component.css']
})
export class StrategyListComponent implements OnInit {
  @Input() strategies: Strategy[];
  @Input() moveToEnd: boolean;

  constructor() { }

  ngOnInit() { }

  scrollToBottom(): void {
    window.scrollTo(0, document.querySelector('#strategy-section').scrollHeight);
  }

  reloadStrategies(strategy: Strategy) {
    this.strategies.splice(this.strategies.indexOf(strategy), 1);
  }

}
