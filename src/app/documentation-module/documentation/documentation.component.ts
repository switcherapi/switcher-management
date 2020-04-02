import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  toggleMenu(): void {
    if (document.getElementById('sidebar').className == 'active')
      document.getElementById('sidebar').className = "";
    else
      document.getElementById('sidebar').className = "active";
  }

}
