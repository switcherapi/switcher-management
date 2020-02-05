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

  scrollToElement($element): void {
    setTimeout(() => {
      $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }, 200);
  }

  reloadStrategies(strategy: Strategy) {
    this.strategies.splice(this.strategies.indexOf(strategy), 1);
  }

}
