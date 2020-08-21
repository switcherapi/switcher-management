import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { QueryRef, Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { FormControl } from '@angular/forms';
import { Types } from 'src/app/model/path-route';
import { DomainRouteService } from 'src/app/services/domain-route.service';

@Component({
  selector: 'element-autocomplete',
  templateUrl: './element-autocomplete.component.html',
  styleUrls: ['./element-autocomplete.component.css']
})
export class ElementAutocompleteComponent implements OnInit, OnDestroy {

  private unsubscribe: Subject<void> = new Subject();

  @Input() domain: string;
  @Input() parentComponent: OnElementAutocomplete;
  @Input() switchers: boolean = true;
  @Input() groups: boolean = true;
  @Input() components: boolean = true;
  @Input() value: string = '';
  @Input() lockFilter: boolean = false;
  
  smartSearchFormControl = new FormControl('');
  searchListItems: any[] = [];
  searchedValues: Observable<string[]>;
  private query: QueryRef<any>;

  constructor(
    private domainRouteService: DomainRouteService,
    private apollo: Apollo,
  ) { }

  ngOnInit() {
    this.loadKeys();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadKeys() {
    this.query = this.apollo.watchQuery({
      query: this.generateGql(),
      variables: { 
        id: this.domain,
      }
    });

    this.query.valueChanges.pipe(takeUntil(this.unsubscribe)).subscribe(result => {
      if (result) {
        this.smartSearchFormControl.setValue(this.value);
        let switchers, groups, components;
        this.searchListItems = [];
        
        if (this.groups) {
          groups = result.data.domain.group.map(group => {
            return {
              type: 'Group',
              _id: group._id,
              description: group.description,
              parent: '',
              name: group.name
            }
          });
          this.searchListItems.push(...groups);
        }

        if (this.switchers) {
          switchers = result.data.domain.group.map(group => group.config.map(config => {
            return {
              type: 'Switcher',
              _id: config._id,
              description: config.description,
              parent: group,
              name: config.key
            }
          }));
          this.searchListItems.push(...switchers.flat());
        }

        if (this.components) {
          components = result.data.domain.group.map(
            group => group.config.map(config => {
              return {
                type: 'Component',
                _id: config._id,
                description: config.components.toString() || '',
                parent: group,
                name: config.key
              }
          }).filter(comp => comp.description.length));
          this.searchListItems.push(...components.flat());
        }
      }
    }, error => {
      ConsoleLogger.printError(error);
    });

    this.searchedValues = this.smartSearchFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: any): any[] {
    let filterValue: any[] = [];

    if((value as any).type) {
      filterValue.push(value.name);
      this.smartSearchFormControl.setValue(value.name);
      this.parentComponent.onSelectElementFilter(value);
      return;
    }

    filterValue = value.toLowerCase();
    return this.searchListItems.filter(item =>
      item.name.toLowerCase().includes(filterValue) ||
      item.description.toLowerCase().includes(filterValue)
    );
  }

  generateGql(): any {
    return gql`
      query domain($id: String!) {
        domain(_id: $id) {
          group {
            ${this.groups ? '_id name description' : ''}
            config {
                ${this.switchers ? '_id key description' : ''}
                ${this.components ? 'components' : ''}
                strategies {
                    values
                }
            }
          }
        }
      }
  `;
  }
}

export declare interface OnElementAutocomplete {

  onSelectElementFilter(value: any): void;

}