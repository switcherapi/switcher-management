export class PathRoute {
  id: string;
  element: any;
  name: string;
  path: string;
  type: string;
}

export class Types {
  public static DOMAIN_TYPE ='Domain';
  public static GROUP_TYPE ='Group';
  public static CONFIG_TYPE ='Config';

  public static SELECTED_DOMAIN ='switcher.selectedDomain';
  public static SELECTED_GROUP ='switcher.selectedGroup';
  public static SELECTED_CONFIG ='switcher.selectedConfig';
  public static SELECTED_TEAM = 'switcher.selectedTeam';
  public static CURRENT_ROUTE = 'switcher.currentRoute';
}