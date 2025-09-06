import { Component, Input, OnInit, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
export class AppVersionComponent implements OnInit {
  private readonly authService = inject(AuthService);

  private readonly unsubscribe = new Subject<void>();

  @Input() apiVersion: string;
  apiReleaseTime: string;
  smVersion: string;
  smReleaseTime: string;

  ngOnInit(): void {
    this.smVersion = environment.version;
    this.smReleaseTime = this.toLocaleString(environment.releaseTime);

    if (!this.apiVersion) {
      this.loadApiMetadata();
    }
  }

  private loadApiMetadata(): void {
    this.authService.isAlive().pipe(takeUntil(this.unsubscribe)).subscribe({
      next: (data) => {
        if (data) {
          this.apiVersion = data.attributes.version;
          this.apiReleaseTime = this.toLocaleString(data.attributes.release_time);
        }
      },
      error: (error) => {
        ConsoleLogger.printError(error);
        this.apiVersion = '[offline]';
      }
    });
  }

  private toLocaleString(utcDateString: string): string {
    const utcDate = new Date(utcDateString);
    const localDateString = utcDate.toLocaleString();
    
    return localDateString;
  }

}
