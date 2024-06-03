import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { PwaService } from './services/pwa.service';
import { FeatureService } from './services/feature.service';

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
      private pwaService: PwaService,
      private featureService: FeatureService
  ) {
    this.loadUserSettings();
    this.loadThemeFromSystem();
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
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleDarkMode() {
    const darkMode = document.documentElement.classList.toggle("dark-mode");
    this.authService.setUserInfo("darkMode", String(darkMode));
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

  private loadThemeFromSystem(): void {
    this.featureService.isEnabled({ feature: 'THEME_FROM_SYSTEM' }).subscribe(response => {
      if (response.status) {
        this.setDarkTheme();

        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', e => {
            this.setDarkTheme();
            window.location.reload();
          });
      }
    });
  }

  private setDarkTheme(): void {
    const darkThemeUserPreference = this.authService.getUserInfo("darkMode");

    // Only load dark theme from system if user has not set a preference
    if (!darkThemeUserPreference) {
      const darkThemeOn = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (darkThemeOn) {
        document.documentElement.classList.add("dark-mode");
      } else {
        document.documentElement.classList.remove("dark-mode");
      }
    }
  }
  
}