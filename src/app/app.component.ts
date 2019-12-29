import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

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

  logout() {
      this.authService.logout();
      this.router.navigate(['/login']);
  }
  
}