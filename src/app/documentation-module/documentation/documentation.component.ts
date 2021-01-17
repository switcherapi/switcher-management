import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css']
})
export class DocumentationComponent implements OnInit, OnDestroy {
  sideBarTopPos: number;
  prevScrollpos = window.pageYOffset;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    this.scrollMenuHandler();
  }

  ngOnDestroy() {
    window.onscroll = function () {};
  }

  toggleMenu(): void {
    if (document.getElementById('sidebar').className == 'active') {
      document.getElementById('sidebar').className = "";
      document.getElementById('content').className = "";
    } else {
      window.scrollTo(0, 0);
      document.getElementById('sidebar').className = "active";
      document.getElementById('content').className = "hide";
    }
  }

  onSearch(query: string): void {
    if (query.length >= 3) {
      this.router.navigate(['/documentation/search', query]);
      this.toggleMenu();
    }
  }

  scrollMenuHandler() {
    window.onscroll = function () {
      var currentScrollPos = window.pageYOffset;
      if (this.prevScrollpos > currentScrollPos) {
          document.getElementById("sidebarCollapse").style.top = "0";
      } else {
          document.getElementById("sidebarCollapse").style.top = "-60px";
      }
      this.prevScrollpos = currentScrollPos;
    }
  }

}
