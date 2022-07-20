import { Config } from './config';
import { Domain } from './domain'
import { Group } from './group';

export class GraphQLConfigurationResultSet {
  configuration: Configuration;
}

export class Configuration {
  domain: Domain;
  group: Group[];
  config: Config[];
}