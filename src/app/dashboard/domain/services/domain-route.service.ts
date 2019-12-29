import { Injectable, Output, EventEmitter } from '@angular/core';

import { PathRoute, Types } from '../model/path-route';

@Injectable()
export class DomainRouteService {

  @Output() pathChange: EventEmitter<PathRoute> = new EventEmitter();

  constructor(
  ) { }

  updatePath(pathRoute: PathRoute) {
    if (pathRoute.type === Types.DOMAIN_TYPE) {
      sessionStorage.removeItem(Types.SELECTED_GROUP);
      sessionStorage.removeItem(Types.SELECTED_CONFIG);
      sessionStorage.setItem(Types.SELECTED_DOMAIN, JSON.stringify(pathRoute));
    } else if (pathRoute.type === Types.GROUP_TYPE) {
      sessionStorage.removeItem(Types.SELECTED_CONFIG);
      sessionStorage.setItem(Types.SELECTED_GROUP, JSON.stringify(pathRoute));
    } else if (pathRoute.type === Types.CONFIG_TYPE) {
      sessionStorage.setItem(Types.SELECTED_CONFIG, JSON.stringify(pathRoute));
    }

    this.pathChange.emit(pathRoute);
  }

  getPathElement(elementType: string) : PathRoute {
    return JSON.parse(sessionStorage.getItem(elementType));
  }

}

