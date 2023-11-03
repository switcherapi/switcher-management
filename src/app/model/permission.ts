export class Permission {
  _id: string;
  action: string;
  active: boolean;
  router: string;
  environments: string[];
  identifiedBy: string;
  values: string[];
}

export class GraphQLPermissionResultSet {
  permission: Permissions[];
}

export class Permissions {
  id: string;
  name: string;
  permissions: ResultPermission[];
}

export class ResultPermission {
  action: string;
  result: string;
}