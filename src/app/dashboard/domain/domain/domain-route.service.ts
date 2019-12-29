import { Injectable, Output, EventEmitter } from '@angular/core';

import { PathRoute } from './path-route';

@Injectable()
export class DomainRouteService {

  @Output() pathChange: EventEmitter<PathRoute> = new EventEmitter();

  constructor(
  ) { }

  updatePath(pathRoute: PathRoute) {
    if (pathRoute.type === 'Domain') {
      sessionStorage.removeItem('selectedGroup');
      sessionStorage.removeItem('selectedConfig');
      sessionStorage.setItem('selectedDomain', JSON.stringify(pathRoute));
    } else if (pathRoute.type === 'Group') {
      sessionStorage.removeItem('selectedConfig');
      sessionStorage.setItem('selectedGroup', JSON.stringify(pathRoute));
    } else if (pathRoute.type === 'Config') {
      sessionStorage.setItem('selectedConfig', JSON.stringify(pathRoute));
    }

    this.pathChange.emit(pathRoute);
  }

  getPathElement(elementType: string) : PathRoute {
    return JSON.parse(sessionStorage.getItem(elementType));
  }

}

