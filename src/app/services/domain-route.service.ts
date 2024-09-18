import { Injectable, Output, EventEmitter } from '@angular/core';
import { PathRoute, Types } from '../model/path-route';

@Injectable()
export class DomainRouteService {
  @Output() pathChange = new EventEmitter<PathRoute>();
  @Output() viewHeaderEvent = new EventEmitter<ViewHeader>();

  updatePath(id: string, name: string, type: string, path: string, forceFetch = false): void {
    const pathRoute = new PathRoute();
    pathRoute.id = id;
    pathRoute.name = name;
    pathRoute.type = type;
    pathRoute.path = path;
    pathRoute.forceFetch = forceFetch;

    localStorage.setItem(Types.CURRENT_ROUTE, JSON.stringify(pathRoute));
    this.pathChange.next(pathRoute);
  }

  getStoredPath(): PathRoute {
    return JSON.parse(localStorage.getItem(Types.CURRENT_ROUTE));
  }

  getPreviousPath(): string {
    const pathRoute = this.getStoredPath();
    if (pathRoute) {
      const listingPath = pathRoute.path.substring(0, pathRoute.path.lastIndexOf('/'));
      return listingPath.substring(0, listingPath.lastIndexOf('/'));
    }

    return '/dashboard/domain';
  }

  updateView(title: string, icon: number) {
    const viewHeader = new ViewHeader();
    viewHeader.title = title;
    viewHeader.icon = icon;
    this.viewHeaderEvent.next(viewHeader);
  }

}

export class ViewHeader {
  icon: number;
  title: string;
}
