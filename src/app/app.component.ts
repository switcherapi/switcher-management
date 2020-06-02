import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [`
    .backgroud-style {
      background: #24292e !important;
      padding-top: 0;
      padding-bottom: 0;
    }

    .divider-style {
      width: 40px;
      transform: rotate(90deg);
      color:white;
      background:#89847d;
    }
  `]
})
export class AppComponent implements OnDestroy {

  currentToken: String; 

  constructor(
      private router: Router,
      private authService: AuthService
  ) {
    this.authService.currentToken.subscribe(x => this.currentToken = x);
  }

  ngOnInit() {
    this.authService.logoff.subscribe((currentToken: String) => {
      this.currentToken = currentToken;
    })
  }

  ngOnDestroy(): void {
    this.authService.logoff.unsubscribe();
  }

  logout() {
      this.authService.logout();
      this.router.navigate(['/']);
  }
  
}