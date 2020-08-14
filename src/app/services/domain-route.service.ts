import { Injectable, Output, EventEmitter } from '@angular/core';
import { PathRoute, Types } from '../model/path-route';


@Injectable()
export class DomainRouteService {

  @Output() pathChange: EventEmitter<PathRoute> = new EventEmitter();

  constructor(
  ) { }

  updatePath(pathRoute: PathRoute, isRouteTo: boolean) {
    if (pathRoute.type === Types.DOMAIN_TYPE) {
      localStorage.setItem(Types.SELECTED_DOMAIN, JSON.stringify(pathRoute));
    } else if (pathRoute.type === Types.GROUP_TYPE) {
      localStorage.setItem(Types.SELECTED_GROUP, JSON.stringify(pathRoute));
    } else if (pathRoute.type === Types.CONFIG_TYPE) {
      localStorage.setItem(Types.SELECTED_CONFIG, JSON.stringify(pathRoute));
    }

    if (isRouteTo) {
      sessionStorage.setItem(Types.CURRENT_ROUTE, JSON.stringify(pathRoute));
    }
    this.pathChange.emit(pathRoute);
  }

  getPathElement(elementType: string) : PathRoute {
    return elementType == Types.CURRENT_ROUTE ? 
      JSON.parse(sessionStorage.getItem(elementType)) : JSON.parse(localStorage.getItem(elementType));
  }

  removePath(elementType: string) {
    if (elementType === Types.DOMAIN_TYPE) {
      localStorage.removeItem(Types.SELECTED_DOMAIN);
      localStorage.removeItem(Types.SELECTED_GROUP);
      localStorage.removeItem(Types.SELECTED_CONFIG);
      sessionStorage.removeItem(Types.CURRENT_ROUTE);
    } else if (elementType === Types.GROUP_TYPE) {
      localStorage.removeItem(Types.SELECTED_GROUP);
      localStorage.removeItem(Types.SELECTED_CONFIG);
      sessionStorage.removeItem(Types.CURRENT_ROUTE);
      sessionStorage.setItem(Types.CURRENT_ROUTE, sessionStorage.getItem(Types.SELECTED_DOMAIN));
      this.pathChange.emit(this.getPathElement(Types.DOMAIN_TYPE));
    } else if (elementType === Types.CONFIG_TYPE) {
      localStorage.removeItem(Types.SELECTED_CONFIG);
      sessionStorage.removeItem(Types.CURRENT_ROUTE);
      sessionStorage.setItem(Types.CURRENT_ROUTE, sessionStorage.getItem(Types.SELECTED_GROUP));
      this.pathChange.emit(this.getPathElement(Types.GROUP_TYPE));
    }
  }

}

