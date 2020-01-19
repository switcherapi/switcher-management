import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Strategy } from '../../model/strategy';

@Component({
  selector: 'app-strategy-list',
  templateUrl: './strategy-list.component.html',
  styleUrls: ['./strategy-list.component.css']
})
export class StrategyListComponent implements OnInit {
  @Input() strategies = new EventEmitter<Strategy[]>();

  constructor() { }

  ngOnInit() { }

  scrollToBottom(): void {
    window.scrollTo(0, document.querySelector('#strategy-section').scrollHeight);
  }

}
