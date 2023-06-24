import { Component, Input } from '@angular/core';
import { ConfigDetailComponent } from '../config-detail/config-detail.component';
import { Strategy } from 'src/app/model/strategy';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-strategy-list',
  templateUrl: './strategy-list.component.html',
  styleUrls: ['./strategy-list.component.css']
})
export class StrategyListComponent {
  @Input() strategies: BehaviorSubject<Strategy[]>;
  @Input() moveToEnd: boolean;
  @Input() parent: ConfigDetailComponent;

  scrollToElement($element: any): void {
    setTimeout(() => {
      $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }, 200);
  }

  reloadStrategies(strategy: Strategy) {
    const strategies = this.strategies.getValue();
    strategies.splice(strategies.indexOf(strategy), 1);
    this.parent.hasStrategies = strategies.length > 0;

    if (!this.parent.hasStrategies)
      this.parent.updateNavTab(3);
  }

  updateStrategies(strategy: Strategy) {
    const strategies = this.strategies.getValue();
    strategies.forEach(s => {
      if (s.id === strategy.id) {
        Object.assign(s, strategy);
      }
    });

    this.strategies.next(strategies);
  }

}
