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

export const snapshotQuery = (includeStatusByEnv = true, includeDescription = true) => {
  return gql`
      query domain($id: String!, $environment: String!, $_component: String) {
        domain(_id: $id, environment: $environment, _component: $_component) {
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
              relay {
                relay_type
                relay_method
                relay_endpoint
                activated
                ${includeDescription ? 'description' : ''}
                ${includeStatusByEnv ? STATUS_BY_ENV : ''}
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

export const permissionQuery = () => {
  return gql`
    query permission($domain: String!, $router: String!, $actions: [String]!, $parent: String, $environment: String) {
      permission(domain: $domain, router: $router, actions: $actions, parent: $parent, environment: $environment) {
        id
        name
        permissions {
            action
            result
        }
      }
    }
`;
};