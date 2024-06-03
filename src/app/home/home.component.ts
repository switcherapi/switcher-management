import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getImage(resource: string): string {
    const hasDaskClass = document.documentElement.classList.contains("dark-mode");
    const darkPrefix = hasDaskClass ? '_dark' : '';

    return `assets/${resource}${darkPrefix}.png`;
  }

}
