import { Component, input, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/services/auth.service';
import { ConsoleLogger } from '../_helpers/console-logger';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-version',
    templateUrl: './app-version.component.html',
    styleUrls: ['./app-version.component.css'],
    imports: [MatTooltip]
})
export class AppVersionComponent {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly apiVersion = input<string>();
  readonly apiReleaseTime = signal<string>('');
  readonly smVersion = signal<string>(environment.version);
  readonly smReleaseTime = signal<string>(this.toLocaleString(environment.releaseTime));

  constructor() {
    if (!this.apiVersion()) {
      this.loadApiMetadata();
    }
  }

  private loadApiMetadata(): void {
    this.authService.isAlive().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (data) {
          this.apiReleaseTime.set(this.toLocaleString(data.attributes.release_time));
        }
      },
      error: (error) => {
        ConsoleLogger.printError(error);
      }
    });
  }

  private toLocaleString(utcDateString: string): string {
    try {
      const utcDate = new Date(utcDateString);
      const localDateString = utcDate.toLocaleString();
      
      return localDateString;
    } catch (error) {
      ConsoleLogger.printError(error);
      return utcDateString;
    }
  }
}
