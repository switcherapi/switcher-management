import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * BlockUIComponent is based on ng-block-ui library (https://github.com/kuuurt13/ng-block-ui)
 */
@Component({
  selector: 'app-block-ui',
  template: `
    <div class="app-block-ui-wrapper" *ngIf="isBlocked">
      <div class="app-block-ui-overlay"></div>
      <div class="app-block-ui-content">
          <div class="app-block-ui-spinner" *ngIf="showSpinner">
            <div class="loader"></div>
            <div *ngIf="message" class="message">
              {{ message }}
            </div>
          </div>
      </div>
    </div>
    <ng-content></ng-content>
  `,
  styleUrls: ['./block-ui.component.css'],
  imports: [CommonModule],
  standalone: true,
})
export class BlockUIComponent {
  @Input() isBlocked = false;
  @Input() showSpinner = true;
  @Input() message: string | null = null;
}