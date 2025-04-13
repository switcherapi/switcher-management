***

<div align="center">
<b>Switcher Management</b><br>
</div>

<div align="center">

[![Master CI](https://github.com/switcherapi/switcher-management/actions/workflows/master.yml/badge.svg?branch=master)](https://github.com/switcherapi/switcher-management/actions/workflows/master.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/switcherapi/switcher-management/badge.svg?targetFile=package.json)](https://snyk.io/test/github/switcherapi/switcher-management?targetFile=package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Hub](https://img.shields.io/docker/pulls/trackerforce/switcher-management.svg)](https://hub.docker.com/r/trackerforce/switcher-management)
[![Slack: Switcher-HQ](https://img.shields.io/badge/slack-@switcher/hq-blue.svg?logo=slack)](https://switcher-hq.slack.com/)

</div>

***

![Switcher API Management: Cloud-based Feature Flag API](https://github.com/switcherapi/switcherapi-assets/blob/master/logo/switcherapi_management_grey.png)

# About  
**Switcher Management** is a complete GUI to manage Switcher API

 - **Switcher API**: (https://github.com/switcherapi/switcher-api)
 - **Switcher Resolver Node**: (https://github.com/switcherapi/switcher-resolver-node)
 - **JavaScript SDK**: (https://github.com/switcherapi/switcher-client-js)
 - **Java SDK**: (https://github.com/switcherapi/switcher-client-java)
 - **Deno SDK**: (https://github.com/switcherapi/switcher-client-deno)
 - **Python SDK**: (https://github.com/switcherapi/switcher-client-py)

# Cloud Hosted API

Sign up for a free account using our Cloud hosted API : [cloud.switcherapi.com](https://cloud.switcherapi.com)<br>
Join us on [Slack](https://switcher-hq.slack.com/), [Discord Server](https://discord.gg/cqgdb9Ef) or [Discussion Area](https://github.com/switcherapi/switcher-management/discussions) if you have questions about your account.

# Contributing

We welcome contributions to Switcher Management! Please read our [contributing guidelines](CONTRIBUTING.md) for more information on how to get started.
Please also check our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a positive and inclusive environment for all contributors.

### Local Development

Get started with devcontainer setup. This will allow you to run the application and validate your changes locally.<br>
You can either use Github Codespaces or run the devcontainer locally using Docker.

The devcontainer includes Switcher API and MongoDB already configured.<br>
Make sure to replace the API endpoint in the `src/environments/environment.ts` (apiUrl) to `http://localhost:3000`