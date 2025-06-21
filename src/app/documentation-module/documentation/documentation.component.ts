import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.css'],
  standalone: false
})
export class DocumentationComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);

  sideBarTopPos: number;
  prevScrollpos = window.scrollY;

  ngOnInit() {
    this.scrollMenuHandler();
  }

  ngOnDestroy() {
    window.onscroll = () => {
      return;
    };
  }

  toggleMenu(selection?: HTMLElement): void {
    if (selection) {
      this.setMenuSelection(selection.id);
    }

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
      const currentScrollPos = window.scrollY;
      if (this.prevScrollpos > currentScrollPos) {
          document.getElementById("sidebarCollapse").style.top = "0px";
      } else {
          document.getElementById("sidebarCollapse").style.top = "-60px";
      }
      this.prevScrollpos = currentScrollPos;
    }
  }

  private setMenuSelection(selectionMenu?: string) {
    const selectedItems = Array.from(document.getElementsByClassName('selected-item'));
    for (const element of selectedItems) {
      element.classList.remove('selected-item');
    }
  
    if (selectionMenu) {
      document.getElementById(selectionMenu)?.classList.add('selected-item');
    }
  }

}
