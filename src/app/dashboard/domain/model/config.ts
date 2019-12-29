export class Config {
  id: string;
  key: string;
  description: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  activated: Map<string, boolean>;
}