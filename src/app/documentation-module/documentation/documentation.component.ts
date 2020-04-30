import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit {
  sideBarTopPos: number;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}

  toggleMenu(): void {
    if (document.getElementById('sidebar').className == 'active') {
      document.getElementById('sidebar').className = "";
      document.getElementById('content').className = "";
    }
    else {
      document.getElementById('sidebar').className = "active";
      document.getElementById('content').className = "hide";
    }
  }

  onSearch(query: string): void {
    this.router.navigate(['/documentation/search', query]);
  }

}
