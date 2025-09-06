import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * BlockUIComponent is based on ng-block-ui library (https://github.com/kuuurt13/ng-block-ui)
 */
@Component({
  selector: 'app-block-ui',
  template: `
    @if (isBlocked) {
    <div class="app-block-ui-wrapper">
      <div class="app-block-ui-overlay"></div>
      <div class="app-block-ui-content">
        @if (showSpinner) {
        <div class="app-block-ui-spinner">
          <div class="loader"></div>
          @if (message) {
            <div class="message">
              {{ message }}
            </div>
          }
        </div>
        }
      </div>
    </div>
    }
    <ng-content></ng-content>
  `,
  styleUrls: ['./block-ui.component.css'],
  imports: [CommonModule]
})
export class BlockUIComponent {
  @Input() isBlocked = false;
  @Input() showSpinner = true;
  @Input() message: string | null = null;
}