import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/services/auth.service';
import { ConsoleLogger } from '../_helpers/console-logger';

@Component({
  selector: 'app-version',
  templateUrl: './app-version.component.html',
  styleUrls: ['./app-version.component.css']
})
export class AppVersionComponent implements OnInit {
  private unsubscribe: Subject<void> = new Subject();

  @Input() apiVersion: string;
  apiReleaseTime: string;
  smVersion: string = environment.version;
  smReleaseTime: string = environment.releaseTime;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    if (!this.apiVersion)
      this.loadData();
  }

  private loadData(): void {
    this.authService.isAlive().pipe(takeUntil(this.unsubscribe)).subscribe({
      next: (data) => {
        if (data) {
          this.apiVersion = data.attributes.version;
          this.apiReleaseTime = data.attributes.release_time;
        }
      },
      error: (error) => {
        ConsoleLogger.printError(error);
        this.apiVersion = '[offline]';
      }
    });
  }

}
