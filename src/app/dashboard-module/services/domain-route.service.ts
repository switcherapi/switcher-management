import { Injectable, Output, EventEmitter } from '@angular/core';

import { PathRoute, Types } from '../domain-module/model/path-route';

@Injectable()
export class DomainRouteService {

  @Output() pathChange: EventEmitter<PathRoute> = new EventEmitter();

  constructor(
  ) { }

  updatePath(pathRoute: PathRoute) {
    if (pathRoute.type === Types.DOMAIN_TYPE) {
      localStorage.removeItem(Types.SELECTED_GROUP);
      localStorage.removeItem(Types.SELECTED_CONFIG);
      localStorage.setItem(Types.SELECTED_DOMAIN, JSON.stringify(pathRoute));
    } else if (pathRoute.type === Types.GROUP_TYPE) {
      localStorage.removeItem(Types.SELECTED_CONFIG);
      localStorage.setItem(Types.SELECTED_GROUP, JSON.stringify(pathRoute));
    } else if (pathRoute.type === Types.CONFIG_TYPE) {
      localStorage.setItem(Types.SELECTED_CONFIG, JSON.stringify(pathRoute));
    }

    localStorage.setItem(Types.CURRENT_ROUTE, JSON.stringify(pathRoute));
    this.pathChange.emit(pathRoute);
  }

  getPathElement(elementType: string) : PathRoute {
    return JSON.parse(localStorage.getItem(elementType));
  }

}

