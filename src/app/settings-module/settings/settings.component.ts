import { Component, signal } from '@angular/core';
import { ToastsContainerComponent } from '../../_helpers/toasts-container.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    imports: [ToastsContainerComponent, RouterLink, RouterOutlet]
})
export class SettingsComponent {

  readonly navControl = signal<boolean>(false);

  navToggled(): void {
    this.navControl.set(!this.navControl());
  }

}
