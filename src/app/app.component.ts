import { Component, inject, signal, DestroyRef } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './auth/services/auth.service';
import { PwaService } from './services/pwa.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, RouterLink, MatIconModule, MatDividerModule]
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly pwaService = inject(PwaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentToken = signal<string>('');
  readonly loggedUserName = signal<string>('');
  readonly profileAvatar = signal<string>('');
  readonly darkMode = signal<boolean>(false);

  constructor() {
    this.pwaService.checkForUpdate();
    this.setupSubscriptions();
    this.loadUserSettings();
  }

  private setupSubscriptions(): void {
    this.authService.logoff.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((currentToken: string) => {
        this.currentToken.set(currentToken);
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.reloadTheme();
  }

  toggleDarkMode(): void {
    const isDark = document.documentElement.classList.toggle("dark-mode");
    this.darkMode.set(isDark);
    document.documentElement.dispatchEvent(new Event("dark-mode"));
    this.updateTheme();
  }

  showHome() {
    return environment.allowHomeView;
  }

  onMenuClick(menuId: string): void {
    const mainMenu = document.getElementById(menuId);
    if (mainMenu) {
      mainMenu.style.display = "none";
    }

    setTimeout(() => {
      if (mainMenu) {
        mainMenu.style.display = "block";
      }
    }, 500);
  }

  private loadUserSettings(): void {
    this.authService.currentToken.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(token => {
        this.currentToken.set(token);
      });

    this.authService.currentUser.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loggedUserName.set(this.authService.getUserInfo("name"));
        const avatar = this.authService.getUserInfo("avatar");
        this.profileAvatar.set(avatar || String.raw`assets\switcherapi_mark_white.png`);
      });

    this.reloadTheme();
  }

  private reloadTheme(): void {
    const savedTheme = localStorage.getItem("THEME");
    if (!savedTheme) {
      const isDark = document.documentElement.classList.contains("dark-mode");
      this.darkMode.set(isDark);
      this.updateTheme();
    } else if (savedTheme === "dark") {
      this.darkMode.set(true);
      document.documentElement.classList.add("dark-mode");
    }
  }

  private updateTheme(): void {
    localStorage.setItem("THEME", this.darkMode() ? "dark" : "light");
  }
  
}