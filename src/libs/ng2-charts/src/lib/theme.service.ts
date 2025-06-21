import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public colorschemesOptions: BehaviorSubject<ChartOptions | undefined> =
    new BehaviorSubject<ChartOptions | undefined>(undefined);

  setColorschemesOptions(options: ChartConfiguration['options']): void {
    this.colorschemesOptions.next(options);
  }

  getColorschemesOptions(): ChartConfiguration['options'] | undefined {
    return this.colorschemesOptions.value;
  }
}
