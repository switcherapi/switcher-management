import { Injectable, Output, EventEmitter } from '@angular/core';

import { PathRoute } from './path-route';

@Injectable()
export class DomainRouteService {

  @Output() pathChange: EventEmitter<PathRoute> = new EventEmitter();

  constructor(
  ) { }

  updatePath(pathRoute: PathRoute) {
    this.pathChange.emit(pathRoute);
  }

}

