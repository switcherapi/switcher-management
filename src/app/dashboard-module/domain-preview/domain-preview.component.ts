import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Domain } from 'src/app/model/domain';

@Component({
  selector: 'app-domain-preview',
  templateUrl: './domain-preview.component.html',
  styleUrls: [
    '../domain-module/common/css/preview.component.css', 
    './domain-preview.component.css'
  ]
})
export class DomainPreviewComponent implements OnInit {
  @Input() domain: Domain;

  classStatus: string;
  classBtnStatus: string;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.updateStatus();
  }

  selectDomain() {
    this.router.navigate(['/dashboard/domain/'], { state: { element: JSON.stringify(this.domain) } });
  }

  updateStatus(): void {
    this.classStatus = this.domain.activated['default'] ? 'grid-container activated' : 'grid-container deactivated';
    this.classBtnStatus = this.domain.activated['default'] ? 'btn-element activated' : 'btn-element deactivated';
  }

}
