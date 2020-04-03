import { Component, OnInit, HostListener } from '@angular/core';
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
    if (document.getElementById('sidebar').className == 'active')
      document.getElementById('sidebar').className = "";
    else
      document.getElementById('sidebar').className = "active";
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
    const floatingSidebar = document.getElementById("floatingSidebar");

    if (!this.sideBarTopPos)
      this.sideBarTopPos = floatingSidebar.offsetTop;

    if (window.pageYOffset >= this.sideBarTopPos) {
      floatingSidebar.classList.add("floatSidebar");
    } else {
      floatingSidebar.classList.remove("floatSidebar");
    }
  }

  onSearch(query: string): void {
    if (query)
      this.router.navigate(['/documentation/search', query]);
  }

}
