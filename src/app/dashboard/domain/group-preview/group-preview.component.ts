import { Component, OnInit, Input } from '@angular/core';
import { Group } from '../model/group';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-group-preview',
  templateUrl: './group-preview.component.html',
  styleUrls: ['./group-preview.component.css']
})
export class GroupPreviewComponent implements OnInit {
  @Input() group: Group;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
  }

  getGroupName() {
    return this.group.name;
  }

  getGroup() {
    return this.group;
  }

  selectGroup() {
    this.router.navigate(['/dashboard/domain/group/detail'], { state: { element: JSON.stringify(this.group) } });
  }

}
