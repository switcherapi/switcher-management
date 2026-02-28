import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-documentation',
    templateUrl: './documentation.component.html',
    styleUrls: ['./documentation.component.css'],
    imports: [RouterLink, MatIcon, RouterOutlet]
})
export class DocumentationComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);

  readonly sideBarTopPos = signal<number>(0);
  readonly prevScrollpos = signal<number>(window.scrollY);

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
      document.getElementById('sidebar').className = '';
      document.getElementById('content').className = '';
    } else {
      window.scrollTo(0, 0);
      document.getElementById('sidebar').className = 'active';
      document.getElementById('content').className = 'hide';
    }
  }

  onSearch(query: string): void {
    if (query.length >= 3) {
      this.router.navigate(['/documentation/search', query]);
      this.toggleMenu();
    }
  }

  scrollMenuHandler() {
    window.onscroll = () => {
      const currentScrollPos = window.scrollY;
      const sidebarCollapse = document.getElementById('sidebarCollapse');
      if (sidebarCollapse) {
        if (this.prevScrollpos() > currentScrollPos) {
          sidebarCollapse.style.top = '0px';
        } else {
          sidebarCollapse.style.top = '-60px';
        }
      }
      this.prevScrollpos.set(currentScrollPos);
    };
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
