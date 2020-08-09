import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamPendingMembersComponent } from './team-pending-members.component';

describe('TeamPendingMembersComponent', () => {
  let component: TeamPendingMembersComponent;
  let fixture: ComponentFixture<TeamPendingMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamPendingMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamPendingMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
