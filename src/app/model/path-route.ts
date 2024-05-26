export class PathRoute {
  id: string;
  name: string;
  path: string;
  type: string;
  forceFetch: boolean = false;
}

export class Types {
  public static readonly DOMAIN_TYPE = 'Domain';
  public static readonly GROUP_TYPE = 'Group';
  public static readonly CONFIG_TYPE = 'Switcher';
  public static readonly COMPONENT_TYPE = 'Component';
  public static readonly CURRENT_ROUTE = 'switcher.currentRoute';
}