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

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  getDomainName() {
    return this.domain.name;
  }

  getDomain() {
    return this.domain;
  }

  selectDomain() {
    this.router.navigate(['/dashboard/domain/'], { state: { element: JSON.stringify(this.domain) } });
  }

}
