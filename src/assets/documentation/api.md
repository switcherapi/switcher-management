***

<div align="center">
<b>Switcher API</b><br>
Switching fast. Adapt everywhere.
</div>

***

### Local setup
1. npm install
2. Add .env-cmdrc file into the project directory (use '.env-cmdrc-template')
3. Replace values such as secret keys and URLs

### Auth Providers

Switcher API supports multiple auth providers to sign up and sign in such as email/password, GitHub, and Bitbucket.

Follow the steps below to set up your OAuth App in GitHub and Bitbucket.

#### GitHub OAuth App setup

1. Open your GitHub account or organization settings
2. Go to Developer settings > OAuth Apps
3. Click on "New OAuth App"
4. Fill in the application details:
   - Application name: Switcher API
   - Homepage URL: https://switcher-management-url (or your deployed URL)
   - Authorization callback URL: https://switcher-management-url/login?platform=github
5. Click on "Register application"
6. Copy the Client ID and Client Secret
7. Update your .env-cmdrc file or ConfigMap/Secret in Kubernetes with the following variables:
   - GIT_OAUTH_CLIENT_ID=your_client_id
   - GIT_OAUTH_CLIENT_SECRET=your_client_secret
8. Update Switcher Management GITHUB_CLIENTID environment variable with your_client_id

#### Bitbucket OAuth App setup

1. Open your Bitbucket account or workspace settings
2. Go to Apps and features > OAuth consumers
3. Fill in the application details:
   - Name: Switcher API
   - Callback URL: https://switcher-management-url/login?platform=bitbucket
4. Add permissions -> Account: Read
5. Click on "Save"
6. Copy the Key and Secret
7. Update your .env-cmdrc file or ConfigMap/Secret in Kubernetes with the following variables:
   - BIT_OAUTH_CLIENT_ID=your_client_id
   - BIT_OAUTH_CLIENT_SECRET=your_client_secret
8. Update Switcher Management BITBUCKET_CLIENTID environment variable with your_client_id

### Running Switcher API from Docker Composer manifest file

This option leverages Switcher API and Switcher Management with minimum settings required.

1. Modify the configuration file "config/.env.dev":

- JWT_SECRET: With your secure private key
- SWITCHERAPI_URL: The Switcher API URL that Switcher Management will use internally
- SM_IP: IP/DNS used by Switcher Management internal redirects

2. Run:

```
docker-compose --env-file ./config/.env.dev up -d
```

3. Open Switcher Management:

```
http://localhost
```

### Quick start

Open Swagger UI by accessing the URL: http://localhost:3000/api-docs<br>
Or use Postman by importing either the OpenAPI json from http://localhost:3000/swagger.json or Postman Collection from "requests/Switcher API*"

#### API configuration

##### Signing up
Signing up an account to use Switcher API with an email/password or linking it to a GitHub or Bitbucket account.

- **Singing up via email** - Admin: /admin/signup [POST]
- **Singing up via GitHub** - Admin: /admin/github/auth?code= [POST]
- **Singing up via Bitbucket** - Admin: /admin/bitbucket/auth?code= [POST]
- **Access confirmation** - Admin: /admin/signup/authorization?code= [POST]

##### Domain
Domains are responsible for centralizing all settings and configurations.<br>
It is equivalent to an organization that can manage multiple projects, users, and environments.

- **New domain** - Domain: /domain/create [POST]

##### Component
Components are applications that will use Switcher API.<br>
Each component has its own access API key to interact with Switcher API.

- **Create a component** - Component: /component/create [POST]
- **Generating a new API Key** - Component: /component/generateApiKey [GET]

##### Group
Groups are used to organize Switchers that share the same feature scope.

- **New Group** - GroupConfig: /groupconfig/create [POST]

##### Switcher
Switchers are the entry point to control features in your application.<br>

- **New Switcher** - Config: /config/create [POST]

##### Strategy
Customize the Switcher behavior by including strategy rules to your Switchers.

- **New Strategy** - ConfigStrategy: /configstrategy/create [POST]

#### API usage
In order to use Switcher API, you need to authenticate the component before using it.<br>
See also our SDKs to integrate Switcher API with your application.

- **Auth** - Client API: /criteria/auth [POST]
- **Executing** -  Client API: /criteria?key=SWITCHER_KEY [POST]

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

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[api.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 