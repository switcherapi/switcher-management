import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainRouteComponent } from './domain-route.component';

describe('DomainRouteComponent', () => {
  let component: DomainRouteComponent;
  let fixture: ComponentFixture<DomainRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DomainRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DomainRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
