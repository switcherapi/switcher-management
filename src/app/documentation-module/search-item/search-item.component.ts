import { Component, Input, OnInit } from '@angular/core';
import { SkimmingResult } from '../model/skimming-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: [
    '../../dashboard-module/domain-module/common/css/detail.component.css',
    './search-item.component.css'
  ]
})
export class SearchItemComponent implements OnInit {

  @Input()
  skimmmingResult: SkimmingResult;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    for (let index = 0; index < this.skimmmingResult.segment.length; index++) {
      if (this.skimmmingResult.segment[index].indexOf('<img src=')) {
        this.skimmmingResult.segment[index] = `
        <style>
          .image-style {
            width: 100%;
            max-width: max-content;
            box-shadow: 0px 0px 10px black;
          }
        </style>
        ${this.skimmmingResult.segment[index]}`
      }
    }
  }
  
  gotoDocument(file: string) {
    if (file === 'overview.md') {
      this.router.navigate(['/documentation/']);
      return;
    }
    const route = file.replace('.md', '');
    this.router.navigate(['/documentation/' + route]);
  }

}
