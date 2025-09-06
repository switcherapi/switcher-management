import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [RouterLink]
})
export class HomeComponent {

  getImage(resource: string): string {
    const darkPrefix = document.documentElement.classList.contains("dark-mode") ? '_dark' : '';
    return `assets/${resource}${darkPrefix}.png`;
  }

}
