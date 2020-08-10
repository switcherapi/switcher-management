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
      this.loggedUserName = this.authService.getCookie('switcherapi.user');

      const gitid = this.authService.getCookie('switcherapi.gitid');
      this.profileAvatar = gitid != 'undefined'
        ? `https://avatars2.githubusercontent.com/u/${gitid}?v=3&s=40` : "assets//switcherapi_mark_white.png";
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