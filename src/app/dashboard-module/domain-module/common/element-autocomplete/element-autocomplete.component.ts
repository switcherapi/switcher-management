import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { QueryRef } from 'apollo-angular';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { FormControl } from '@angular/forms';
import { DomainService } from 'src/app/services/domain.service';

@Component({
  selector: 'element-autocomplete',
  templateUrl: './element-autocomplete.component.html',
  styleUrls: ['./element-autocomplete.component.css']
})
export class ElementAutocompleteComponent implements OnInit, OnDestroy {

  private unsubscribe: Subject<void> = new Subject();
  
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
    private domainService: DomainService
  ) { }

  ngOnInit() {
    if (this.value) {
      this.smartSearchFormControl.setValue(this.value);
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadComponent() {
    if (!this.query) {
      this.loadKeys(this.parentComponent.getDomainId());
    } else {
      this.query?.refetch();
    }
  }

  showTooltip(item: any): string {
    return `[${item.name}]: ${item.description}`;
  }

  private loadKeys(domainId: string): void {
    if (!domainId)
      return;

    this.query = this.domainService.executeConfigurationTreeQuery(
      domainId, this.switchers, this.groups, this.components);

    this.query.valueChanges.pipe(takeUntil(this.unsubscribe))
      .subscribe({
        next: result => {
          if (result?.data?.domain?.group) {
            this.searchListItems = [];
            this.loadByGroup(result.data.domain.group);
            this.loadBySwitcher(result.data.domain.group);
            this.loadByComponent(result.data.domain.group);
            
            this.searchListItems = this.searchListItems.filter(item => item != undefined);
          }
        },
        error: error => {
          ConsoleLogger.printError(error);
        }
      });

    this.searchedValues = this.smartSearchFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value))
    );
  }

  private loadByComponent(groups?: any) {
    if (!this.components)
      return;

    let filtered = groups?.map(
      group => group.config?.map(config => {
        return {
          type: 'Component',
          _id: config._id,
          description: config.components.toString() || '',
          parent: group,
          name: config.key
        };
      }).filter(comp => comp.description.length));

    if (filtered)
      this.searchListItems.push(...filtered.flat());
  }

  private loadBySwitcher(groups: any) {
    if (!this.switchers || !groups)
      return;

    let filtered = groups.map(
      group => group.config?.map(config => {
        return {
          type: 'Switcher',
          _id: config._id,
          description: config.description,
          parent: group,
          name: config.key
        };
      }));

    if (filtered)
      this.searchListItems.push(...filtered.flat());
  }

  private loadByGroup(groups: any) {
    if (!this.groups || !groups)
      return;
      
    let filtered = groups.map(group => {
      return {
        type: 'Group',
        _id: group._id,
        description: group.description,
        parent: '',
        name: group.name
      };
    });

    this.searchListItems.push(...filtered);
  }

  private filter(value: any): any[] {
    let filterValue: any[] = [];

    if (value.type) {
      filterValue.push(value.name);
      this.smartSearchFormControl.setValue(value.name);
      this.parentComponent.onSelectElementFilter(value);
      return;
    }

    filterValue = value.toLowerCase();
    let prefix: string, typePrefix: string;
    return this.searchListItems.filter(item => {
      if (filterValue.includes(':')) {
        prefix = filterValue[0];
        typePrefix = this.getPrefix(prefix);
        
        const filterValuePrefix = (filterValue as unknown as string).split(':')[1];
        if ((item.name.toLowerCase().includes(filterValuePrefix) || 
            item.description.toLowerCase().includes(filterValuePrefix)) &&
            item.type.toLowerCase().includes(typePrefix))
          return item;
      } else 
        if (item.name.toLowerCase().includes(filterValue) ||
            item.description.toLowerCase().includes(filterValue) ||
            item.type.toLowerCase().includes(filterValue))
          return item;
      }
    );
  }

  private getPrefix(prefix: string): string {
    if (prefix === 's') return 'switcher';
    if (prefix === 'c') return 'component';
    return 'group';
  }
}

export declare interface OnElementAutocomplete {

  onSelectElementFilter(value: any): void;

  getDomainId(): string;

}