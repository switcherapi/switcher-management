import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterLink]
})
export class HomeComponent {
  private readonly isDarkMode = signal(
    document.documentElement.classList.contains('dark-mode')
  );

  constructor() {
    document.documentElement.addEventListener('dark-mode', this.onDarkModeChange);
  }

  private readonly onDarkModeChange = (): void => {
    this.isDarkMode.set(document.documentElement.classList.contains('dark-mode'));
  };

  getImage(resource: string): string {
    const darkPrefix = this.isDarkMode() ? '_dark' : '';
    return `assets/${resource}${darkPrefix}.png`;
  }
}