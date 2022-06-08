export class Permission {
  _id: string;
  action: string;
  active: boolean;
  router: string;
  identifiedBy: string;
  values: string[];
}