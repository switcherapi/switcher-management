import { Component } from '@angular/core';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false
})
export class HomeComponent {

  getImage(resource: string): string {
    const darkPrefix = document.documentElement.classList.contains("dark-mode") ? '_dark' : '';
    return `assets/${resource}${darkPrefix}.png`;
  }

}
