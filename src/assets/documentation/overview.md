<img src="https://raw.githubusercontent.com/switcherapi/switcherapi-assets/master/docs/SwitcherAPI_connectivity.jpg" class="image-style center" alt=""/><p>

## About
* * *
**Switcher API** is a *Feature Flag* API focused on decreasing the friction caused by changes providing a simple and flexible interface.

Main features:
- Easy to setup and seemless integration with your application using our lightweight Client SDKs.
- Shareable Switchers can be used across multiple applications with high support to observability.
- Multi-environment support. Create and manage features across different environments.
- Add extra layer of verification with custom conditions using Strategies.
- Delegate Switcher criteria decision to external services with Switcher Relay.
- Support to multiple teams and granular access control.
- Integrate with Slack usign Switcher Slack App to enable release flow requests.
- Detailed metrics and logs to help you understand how your features are being used.
- Open Source and free to use.

</br></br>

## How it works
* * *

Orchestrate changes based on business strategies without worrying about what should be done under the hood. Switcher API has the responsibility to evaluate all conditions provided and redirect the flow based on the configuration made during the implementation of the new feature.

<span class="image-style center">*Redirecting the flow of a new feature that need to access a new microservice.*</span>

<img src="https://raw.githubusercontent.com/switcherapi/switcherapi-assets/master/docs/SwitcherAPI_management-TOGGLE_ON.jpg" class="image-style center" alt=""/><p>

<span class="image-style center">*Rollback can be done with zero code or test.*</span>

<img src="https://raw.githubusercontent.com/switcherapi/switcherapi-assets/master/docs/SwitcherAPI_management-TOGGLE_OFF.jpg" class="image-style center" alt=""/>

</br></br>

### Multi-environment & Strategies
* * *

Sometimes covering 100% of tests does not guarantee a successful deployment, nor prevents underestimated reception of a new idea. Switcher API provides the right control to optimize deployment processes, conditioning what and when a new feature can be used. In addition, the multi-environment settings enable a smoother transition, generating less friction and eliminating uncovered scenarios that would cause applications to crash.

<span class="image-style center">*Controlled deployment, guaranteeing a safe launch.*</span>

<img src="https://raw.githubusercontent.com/switcherapi/switcherapi-assets/master/docs/SwitcherAPI_management-ENVIRONMENT.jpg" class="image-style center" alt=""/><p>

<span class="image-style center">*Select who, what and when to use a new feature.*</span>

<img src="https://raw.githubusercontent.com/switcherapi/switcherapi-assets/master/docs/SwitcherAPI_management-STRATEGY.jpg" class="image-style center" alt=""/>

</br></br>

## Source
* * *

| Repository                 | Description                                    |
| -------------------------- | ---------------------------------------------- |
| [**Switcher API**](https://github.com/switcherapi/switcher-api) | Core API that manages all Switcher API configurations |
| [**Switcher Resolver Node**](https://github.com/switcherapi/switcher-resolver-node) | Resolver Node API for Component Switchers |
| [**Switcher Management**](https://github.com/switcherapi/switcher-management) | Portal for managing Switcher API |
| [**Switcher API Helm Charts**](https://github.com/switcherapi/helm-charts) | Switcher API Helm Charts |
| [**Switcher GitOps**](https://github.com/switcherapi/switcher-gitops) | GitOps Domain Snapshot Orchestrator for Switcher API |
| [**Switcher Client - JavaScript SDK**](https://github.com/switcherapi/switcher-client-js) | Switcher Client - JavaScript SDK |
| [**Switcher Client - Java SDK**](https://github.com/switcherapi/switcher-client-java) | Switcher Client - Java SDK |
| [**Switcher Client - Deno SDK**](https://github.com/switcherapi/switcher-client-deno) | Switcher Client - Deno Native SDK |
| [**Switcher Client - Tutorials**](https://github.com/switcherapi/switcherapi-tutorials) | Switcher Client SDK tutorials and code snippets |
| [**Switcher Client - Benchmark**](https://github.com/switcherapi/feature-flag-benchmark) | Benchmark evaluating Switcher SDKs against 5 different Feature Flag main vendors |
| [**Switcher Slack App**](https://github.com/switcherapi/switcher-slack-app) | Switcher API App for Slack |
| [**Switcher Account Control**](https://github.com/switcherapi/switcher-ac) | Relay service to manage accounts in Switcher API |


* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[overview.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 