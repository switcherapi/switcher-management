import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

  currentToken: String;
  loggedUserName: String;
  profileAvatar: String;

  constructor(
      private router: Router,
      private authService: AuthService
  ) {
    this.authService.currentToken.subscribe(x => {
      this.currentToken = x;
      this.loggedUserName = this.authService.getUserInfo('name');

      const avatar = this.authService.getUserInfo('avatar');
      this.profileAvatar = avatar || "assets//switcherapi_mark_white.png";
    });
  }

  ngOnInit() {
    this.authService.logoff.subscribe((currentToken: String) => {
      this.currentToken = currentToken;
    });
  }

  ngOnDestroy(): void {
    this.authService.logoff.unsubscribe();
  }

  logout() {
      this.authService.logout();
      this.router.navigate(['/']);
  }
  
}