import { Component, OnInit, Input } from '@angular/core';
import { ConfigDetailComponent } from '../config-detail/config-detail.component';
import { Strategy } from 'src/app/model/strategy';

@Component({
  selector: 'app-strategy-list',
  templateUrl: './strategy-list.component.html',
  styleUrls: ['./strategy-list.component.css']
})
export class StrategyListComponent implements OnInit {
  @Input() strategies: Strategy[];
  @Input() moveToEnd: boolean;
  @Input() parent: ConfigDetailComponent;

  constructor() { }

  ngOnInit() { }

  scrollToElement($element: any): void {
    setTimeout(() => {
      $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }, 200);
  }

  reloadStrategies(strategy: Strategy) {
    this.strategies.splice(this.strategies.indexOf(strategy), 1);
    this.parent.hasStrategies = this.strategies.length > 0;

    if (!this.parent.hasStrategies)
      this.parent.updateNavTab(3);
  }

}
