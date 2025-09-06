import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastsContainerComponent } from '../../_helpers/toasts-container.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    imports: [ToastsContainerComponent, RouterLink, RouterOutlet]
})
export class SettingsComponent implements OnDestroy {

  private readonly unsubscribe = new Subject<void>();

  navControl = false;

  navToggled() {
    this.navControl = !this.navControl;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
