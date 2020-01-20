import { Component, OnInit, Input } from '@angular/core';
import { Domain } from '../domain-module/model/domain';
import { Router } from '@angular/router';

@Component({
  selector: 'app-domain-preview',
  templateUrl: './domain-preview.component.html',
  styleUrls: ['./domain-preview.component.css']
})
export class DomainPreviewComponent implements OnInit {
  @Input() domain: Domain;

  classStatus: string;

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
  }

}
