import { Component, OnInit, Input } from '@angular/core';
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

  @Input()
  query: string;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    for (let index = 0; index < this.skimmmingResult.segment.length; index++) {
      this.skimmmingResult.segment[index] = 
        this.skimmmingResult.segment[index].replace(this.query.trim(), `<u><b>${this.query.trim()}</b></u>`)
        .replace(this.query.trim().toLocaleLowerCase(), `<u><b>${this.query.trim().toLocaleLowerCase()}</b></u>`);
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
