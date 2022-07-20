import { D } from "@angular/cdk/keycodes";
import gql from "graphql-tag";

const STATUS_BY_ENV = `
  statusByEnv {
    env
    value
  }
`;

const DOMAIN = `
  domain {
    id: _id
    name
    owner
    transfer
    integrations {
      slack
    }
  }
`;

const GROUP = `
  group {
    id: _id
    name
  }
`;

const SWITCHER = `
  config {
    id: _id
    key
  }
`;

export const snapshotQuery = (includeStatusByEnv: boolean = true, includeDescription: boolean = true) => {
  return gql`
      query domain($id: String!, $environment: String!) {
        domain(_id: $id, environment: $environment) {
          name
          version
          ${includeDescription ? 'description' : ''}
          ${includeStatusByEnv ? STATUS_BY_ENV : ''}
          activated
          group {
            name
            ${includeDescription ? 'description' : ''}
            activated
            ${includeStatusByEnv ? STATUS_BY_ENV : ''}
            config {
              key
              ${includeDescription ? 'description' : ''}
              activated
              ${includeStatusByEnv ? STATUS_BY_ENV : ''}
              strategies {
                strategy
                activated
                ${includeStatusByEnv ? STATUS_BY_ENV : ''}
                operation
                values
              }
              components
            }
          }
        }
      }
  `;
};

export const configurationTreeQuery = (switchers: boolean, groups: boolean, components: boolean) => {
  return gql`
    query domain($id: String!) {
      domain(_id: $id) {
        group {
          ${groups ? '_id name description' : ''}
          config {
              ${switchers ? '_id key description' : ''}
              ${components ? 'components' : ''}
              strategies {
                  values
              }
          }
        }
      }
    }
`;
};

export const configurationQueryByDomain = () => {
  return gql`
      query configuration($domain: String!) {
        configuration(domain: $domain) {
          ${DOMAIN}
        }
      }
  `;
};

export const configurationQueryByGroup = () => {
  return gql`
      query configuration($domain: String!, $groupId: String!) {
        configuration(domain: $domain, group_id: $groupId) {
          ${DOMAIN}
          ${GROUP}
        }
      }
  `;
};

export const configurationQueryByConfig = () => {
  return gql`
      query configuration($domain: String!, $configId: String!) {
        configuration(domain: $domain, config_id: $configId) {
          ${DOMAIN}
          ${GROUP}
          ${SWITCHER}
        }
      }
  `;
};