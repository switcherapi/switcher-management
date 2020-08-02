[![Build Status](https://travis-ci.com/switcherapi/switcher-api.svg?branch=master)](https://travis-ci.com/github/switcherapi/switcher-api)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=switcherapi_switcher-api&metric=alert_status)](https://sonarcloud.io/dashboard?id=switcherapi_switcher-api)
[![Coverage Status](https://coveralls.io/repos/github/switcherapi/switcher-api/badge.svg?branch=master)](https://coveralls.io/github/switcherapi/switcher-api?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/switcherapi/switcher-api/badge.svg)](https://snyk.io/test/github/switcherapi/switcher-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### API configuration

#### Signing up
Signing up to Switcher API must be made via Switcher Management.
<br />It can be done by using an email address or linking it to a GitHub account.

- **Singing up via email** - /admin/signup [POST]
```json
{
    "name": "[USER NAME]",
    "email": "[EMAIL ADDRESS]",
    "password": "[PASSWORD]",
    "token": "[GOOGLE reCAPTCHA TOKEN]"
}
```

- **Singing up via GitHub** - /admin/github/auth?code= [POST]
  <br />Code must be set by the API service provider.

#### Domain

- **New domain** - /domain/create [POST]
  <br />The API Key will be generated after creating the domain.
```json
{
    "name": "[DOMAIN NAME]",
    "description": "[DOMAIN DESCRIPTION]"
}
```

#### Component

- **Create a component** - /component/create [POST]
```json
{
    "name": "[COMPONENT NAME]",
    "description": "[COMPONENT DESCRIPTION]",
    "domain": "[DOMAIN ID]"
}
```

- **Generating a new API Key** - /component/generateApiKey/COMPONENT_ID [GET]
  <br />This operation cannot be undone.

#### Group

- **New Group** - /groupconfig/create [POST]
```json
{
    "name": "[GROUP NAME]",
    "description": "[GROUP DESCRIPTION]",
    "domain": "[DOMAIN ID]"
}
```

#### Switcher

- **New Switcher** - /config/create [POST]
```json
{
    "key": "[SWITCHER KEY]",
    "description": "[SWITCHER DESCRIPTION]",
    "group": "[GROUP ID]"
}
```

#### Strategy

- **New Strategy** - /configstrategy/create [POST]
```json
{
    "description": "[STRATEGY DESCRIPTION]",
    "strategy": "[STRATEGY TYPE]",
    "values": ["ARRAY OF VALUES"],
    "operation": "[SRATEGY OPERATION]",
    "config": "[CONFIG ID]",
    "env": "default"
}
```

*env can be replaced by the environment your application is currently running.*

  - **Strategy types**
    - VALUE_VALIDATION

      Plain text validation. No format required.

    - NUMERIC_VALIDATION

      Numeric type validation. It accepts positive/negative and decimal values.

    - NETWORK_VALIDATION

      This validation accept CIDR (e.g. 10.0.0.0/24) or IPv4 (e.g. 10.0.0.1) formats.

    - TIME_VALIDATION

      This validation accept only HH:mm format input.

    - DATE_VALIDATION

      Date validation accept both date and time input (e.g. YYYY-MM-DD or YYYY-MM-DDTHH:mm) formats.

  - **Strategy operations**
    - EXIST / NOT_EXIST
    - EQUAL / NOT_EQUAL
    - GREATER / LOWER / BETWEEN

* * *

### API usage
To use the API, each component must authenticate before executing the API criteria evaluation.

- **Auth** - /criteria/auth [POST]
<br />The header must contain the following:
```
'headers': {
    'switcher-api-key': '[API_KEY]'
}
```
The body must contain the exact registered domain, component, and environment name.
```json
{
   "domain": "[DOMAIN NAME]",
   "component": "[COMPONENT NAME]",
   "environment": "default"
}
```

- **Executing** - /criteria?key=SWITCHER_KEY [POST]
<br />The header must contain the authorization token provided by the criteria/auth endpoint.
```
Bearer Token: [TOKEN]
```

**Optional parameters**

- showReason [true/false]: returns the detailed criteria result.
- showStrategy [true/false]: returns the configured strategy.
- bypassMetric [true/false]: bypass registering the execution result.

**REST - Strategy input**

Multiple input can be provided to the API. In case the registered Switcher does not contain any configured strategy, the input sent is going to be ignored.

```json
{
  "entry": [
    {
      "strategy": "[STRATEGY TYPE]",
      "input": "[VALUE]"
    }]
}
```

**GraphQL - Strategy input** - /graphql [POST]

A GraphQL endpoint can also be used to execute the API. Extra return information can be specified under response block request.

```
{
  criteria(
    key: "[SWITCHER KEY]", 
    bypassMetric: [true/false],
    entry: [
        {
          strategy: "[STRATEGY TYPE]", 
          input: "[VALUE]"
        }
      ]
    ) {
    response {
      result
      reason
    }
  }
}
```