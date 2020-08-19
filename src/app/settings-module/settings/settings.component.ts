import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  private unsubscribe: Subject<void> = new Subject();

  navControl: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  navToggled() {
    this.navControl = !this.navControl;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
