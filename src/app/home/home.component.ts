import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {
  private unsubscribe: Subject<void> = new Subject();

  darkPrefix: string;

  constructor(private authService: AuthService) {
    this.authService.userInfoSubject.pipe(takeUntil(this.unsubscribe)).subscribe(_user => {
      this.darkPrefix = this.authService.getUserInfo("darkMode") == 'true' ? '_dark' : '';
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getImage(resource: string): string {
    return `assets/${resource}${this.darkPrefix}.png`;
  }

}
