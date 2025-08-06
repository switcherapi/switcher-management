import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { PwaService } from './services/pwa.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly pwaService = inject(PwaService);

  currentToken: string;
  loggedUserName: string;
  profileAvatar: string;
  darkMode: boolean;

  constructor() {
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
    this.authService.logout();
    this.router.navigate(['/']);
    this.reloadTheme();
  }

  toggleDarkMode() {
    this.darkMode = document.documentElement.classList.toggle("dark-mode");
    document.documentElement.dispatchEvent(new Event("dark-mode"));
    this.updateTheme();
  }

  showHome() {
    return environment.allowHomeView;
  }

  onMenuClick(menuId: string) {
    const mainMenu = document.getElementById(menuId);
    if (mainMenu) {
      mainMenu.style.display = "none";
    }

    setTimeout(() => {
      mainMenu.style.display = "block";
    }, 500);
  }

  private loadUserSettings(): void {
    this.authService.currentToken.subscribe(x => {
      this.currentToken = x;
    });

    this.authService.currentUser.subscribe(() => {
      this.loggedUserName = this.authService.getUserInfo("name");
      const avatar = this.authService.getUserInfo("avatar");
      this.profileAvatar = avatar || "assets\\switcherapi_mark_white.png";
    });

    this.reloadTheme();
  }

  private reloadTheme() {
    const darkMode = localStorage.getItem("THEME");
    if (!darkMode) {
      this.darkMode = document.documentElement.classList.contains("dark-mode");
      this.updateTheme();
    } else if (darkMode === "dark") {
      this.darkMode = true;
      document.documentElement.classList.add("dark-mode");
    }
  }

  private updateTheme() {
    localStorage.setItem("THEME", this.darkMode ? "dark" : "light");
  }
  
}