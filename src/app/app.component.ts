import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { PwaService } from './services/pwa.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  currentToken: string;
  loggedUserName: string;
  profileAvatar: string;

  constructor(
      private router: Router,
      private authService: AuthService,
      private pwaService: PwaService
  ) {
    this.loadUserSettings();
  }

  ngOnInit() {
    this.pwaService.checkForUpdate();
    this.authService.logoff.subscribe((currentToken: string) => {
      this.currentToken = currentToken;
    });
  }

  ngOnDestroy(): void {
    this.authService.logoff.unsubscribe();
  }

  logout() {
    this.toggleDarkMode(true);
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleDarkMode(logoff?: boolean) {
    if (logoff) {
      document.documentElement.classList.remove("dark-mode");
      this.authService.setUserInfo("darkMode", String(false));
    } else {
      const darkMode = document.documentElement.classList.toggle("dark-mode");
      this.authService.setUserInfo("darkMode", String(darkMode));
    }
  }

  private loadUserSettings(): void {
    this.authService.currentToken.subscribe(x => {
      this.currentToken = x;
    });

    this.authService.currentUser.subscribe(_ => {
      this.loggedUserName = this.authService.getUserInfo("name");
      const avatar = this.authService.getUserInfo("avatar");
      this.profileAvatar = avatar || "assets\\switcherapi_mark_white.png";
    });

    const darkMode = this.authService.getUserInfo("darkMode");
    if (darkMode === "true") {
      document.documentElement.classList.add("dark-mode");
    }
  }
  
}