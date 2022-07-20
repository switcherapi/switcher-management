export class PathRoute {
  id: string;
  name: string;
  path: string;
  type: string;
}

export class Types {
  public static DOMAIN_TYPE = 'Domain';
  public static GROUP_TYPE = 'Group';
  public static CONFIG_TYPE = 'Switcher';
  public static COMPONENT_TYPE = 'Component';
  public static CURRENT_ROUTE = 'switcher.currentRoute';
}