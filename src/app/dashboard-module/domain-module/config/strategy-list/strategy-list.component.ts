import { Component, Input, computed, inject, ChangeDetectorRef } from '@angular/core';
import { ConfigDetailComponent } from '../config-detail/config-detail.component';
import { Strategy } from 'src/app/model/strategy';
import { BehaviorSubject } from 'rxjs';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { StrategyDetailComponent } from '../strategy-detail/strategy-detail.component';

@Component({
    selector: 'app-strategy-list',
    templateUrl: './strategy-list.component.html',
    styleUrls: ['./strategy-list.component.css'],
    imports: [MatTabGroup, MatTab, StrategyDetailComponent]
})
export class StrategyListComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  
  @Input() strategies: BehaviorSubject<Strategy[]>;
  @Input() moveToEnd: boolean;
  @Input() parent: ConfigDetailComponent;

  strategiesSignal = computed(() => this.strategies?.getValue() || []);
  strategiesLength = computed(() => this.strategiesSignal().length);
  selectedTabIndex = computed(() => this.moveToEnd ? this.strategiesLength() : 0);

  scrollToElement($element: any): void {
    setTimeout(() => {
      $element.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    }, 200);
  }

  reloadStrategies(strategy: Strategy) {
    const strategies = this.strategies.getValue();
    strategies.splice(strategies.indexOf(strategy), 1);
    this.strategies.next(strategies);
    this.parent.hasStrategies.set(strategies.length > 0);
    
    this.cdr.detectChanges();
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
