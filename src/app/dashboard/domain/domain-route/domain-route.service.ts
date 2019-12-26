import { Injectable, Output, EventEmitter } from '@angular/core';

import { PathRoute } from './path-route';

@Injectable()
export class DomainRouteService {

  @Output() pathChange: EventEmitter<PathRoute[]> = new EventEmitter();

  pathRouters = [];

  constructor(
    private currentRoute: PathRoute
  ) { }

  updatePath(pathRoute: PathRoute) {
    if (pathRoute.type === 'Domain') {
      this.pathRouters[0] = pathRoute;
    } else if (pathRoute.type === 'Group') {
      this.pathRouters[1] = pathRoute;
    } else if (pathRoute.type === 'Config') {
      this.pathRouters[2] = pathRoute;
    }

    this.currentRoute = pathRoute;
    this.pathChange.emit(this.pathRouters);
  }

  clearPath() {
    this.pathRouters = [];
    this.pathChange.emit(this.pathRouters);
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  getDomain() {
    if (this.pathRouters.length > 0) {
      return this.pathRouters[0]
    }
  }

  getGroup() {
    if (this.pathRouters.length > 1) {
      return this.pathRouters[1]
    }
  }

  getConfig() {
    if (this.pathRouters.length > 2) {
      return this.pathRouters[2]
    }
  }

}

