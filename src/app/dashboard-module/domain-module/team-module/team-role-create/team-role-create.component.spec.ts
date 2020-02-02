import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamRoleCreateComponent } from './team-role-create.component';

describe('TeamRoleCreateComponent', () => {
  let component: TeamRoleCreateComponent;
  let fixture: ComponentFixture<TeamRoleCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamRoleCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamRoleCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
