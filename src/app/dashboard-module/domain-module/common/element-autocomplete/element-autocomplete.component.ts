import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { takeUntil, startWith, map, debounceTime } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { ConsoleLogger } from 'src/app/_helpers/console-logger';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomainService } from 'src/app/services/domain.service';
import { Group } from 'src/app/model/group';
import { Apollo } from 'apollo-angular';
import { MatFormField, MatLabel, MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from '@angular/material/autocomplete';
import { MatTooltip } from '@angular/material/tooltip';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-element-autocomplete',
    templateUrl: './element-autocomplete.component.html',
    styleUrls: ['./element-autocomplete.component.css'],
    imports: [MatFormField, MatLabel, MatInput, FormsModule, MatAutocompleteTrigger, MatTooltip, ReactiveFormsModule, MatAutocomplete, MatOption, AsyncPipe]
})
export class ElementAutocompleteComponent implements OnInit, OnDestroy {
  private readonly domainService = inject(DomainService);


  private readonly unsubscribe = new Subject<void>();
  
  @Input() parentComponent: OnElementAutocomplete;
  @Input() switchers = true;
  @Input() groups = true;
  @Input() components = true;
  @Input() value = '';
  @Input() lockFilter = false;
  
  smartSearchFormControl = new FormControl('');
  searchListItems: any[] = [];
  searchedValues: Observable<any[]>;
  private query: Observable<Apollo.QueryResult<any>>;

  ngOnInit() {
    this.searchedValues = this.smartSearchFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value))
    );
    
    if (this.value) {
      this.smartSearchFormControl.setValue(this.value);
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  loadComponent($event: any) {
    if ($event instanceof MouseEvent) {
      this.loadKeys(this.parentComponent.getDomainId(), true);
    } else {
      this.loadKeys(this.parentComponent.getDomainId());
    }
  }

  showTooltip(item: any): string {
    return `[${item.name}]: ${item.description}`;
  }

  private loadKeys(domainId: string, forceRefresh = false): void {
    if (!domainId) {
      return;
    }

    this.query = this.domainService.executeConfigurationTreeQuery(
      domainId, this.switchers, this.groups, this.components, forceRefresh);

    this.query.pipe(takeUntil(this.unsubscribe), debounceTime(500))
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
  }

  private loadByComponent(groups?: Group[]) {
    if (!this.components) {
      return;
    }

    const filtered = groups?.map(
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

  private loadBySwitcher(groups: Group[]) {
    if (!this.switchers || !groups) {
      return;
    }

    const filtered = groups.map(
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

  private loadByGroup(groups: Group[]) {
    if (!this.groups || !groups) {
      return;
    }
      
    const filtered = groups.map(group => {
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
      return [];
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