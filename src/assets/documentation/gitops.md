#### Overview
* * *

**Switcher GitOps** is used to orchestrate Domain Snapshots for Switcher API. It allows managing feature flags and configurations lifecycle.

- Manages Switchers with GitOps workflow (repository as a source of truth)
- Repository synchronization allows integrated tools such as Switcher API Management and Switcher Slack App to work in sync
- Flexible settings allow you to define the best workflow for your organization
- Orchestrates accounts per Domain environments allowing seamless integration with any branching strategy

<img src="[$ASSETS_LOCATION]/documentation/images/gitops/switcherapi_gitops_banner.png" class="image-style center width-70 dark-invert" alt=""/><p>

#### Getting Started
* * *

To get started with Switcher GitOps, you need to follow these steps:

1. **Create a new repository** in your Git provider (GitHub, GitLab, Bitbucket, etc.)
2. **Generate a personal access token** with the necessary permissions to access the repository (read/write)
3. **Subscribe to GitOps Integration** in Switcher API Management including:
    - **Repository URL**: the URL of the repository you created
    - **Personal Access Token**: the token you generated, which is encrypted and stored securely
    - **Branch**: the branch to use for synchronization
    - **Path**: (optional) the path to the directory containing the Domain Snapshots
    - **Window**: the interval to check for changes in the repository and the API changes
    - **Active**: enable or disable the synchronization
    - **Force Prune**: enable full synchronization (can delete groups, switchers, strategies, etc.)

Once you have completed these steps, you will be able to see the first commit synchronization in your repository as well as monitoring the synchronization status in the GitOps Integration view.

* * *
#### GitOps Accounts

Switcher GitOps allows you to manage multiple accounts per Domain environment. This is useful because it allows you to have different configurations for different environments (e.g., development, staging, production).<br>
So if you have a multi-branch strategy, you can have a different account for each branch, which makes it easier to manage the lifecycle of your feature flags and configurations without impacting other environments.

Here are some examples of how you can set up your accounts:

##### Single Branch Strategy
A single-branch strategy is the simplest way to manage your feature flags and configurations. You have a single account that is synchronized with the main branch of your repository.<br>
All different environments (development, staging, production) are managed by the same branch.

You can also organize environments using directories in the repository. For example:
```plaintext
snapshots/
  development/
    dev.json
  production/
    default.json
```

(*) The file name is determined by the environment name created in Switcher API Management followed by the `.json` extension.

##### Multi-Branch Strategy
A multi-branch strategy is useful when you have different environments that need to be managed separately. You can create a different account for each branch per environment.<br>
For example, you can have a `development` account for the `develop` branch, a `staging` account for the `staging` branch, and a `production` account for the `main` branch.

You may wonder how to update the tokens for all these accounts simultaneously. The answer is that you can use the same token for all accounts, and update it using the `Options` menu in your GitOps Integration view, then click on `Update Token`.<br>
Then you can select all environments for which you want to update the token.

* * *
#### Force Refresh

An account can be disabled for receiving updates from the repository. The `Force Refresh` feature allows you to synchronize the account with the repository when the account is enabled again.<br>

* * *
#### Account Monitoring

As you manage multiple accounts per Domain environment, you can monitor the synchronization status of each account in the GitOps Integration view.<br>
The left side panel shows the latest synchronization status for each account, which contains the following details:

- **Status**: the synchronization status, which can be:
    - `Pending`: the synchronization is in progress (account was just created or disabled)
    - `Synced`: the synchronization was successful
    - `OutSync`: the synchronization has identified differences between the repository and the account
    - `Error`: an error occurred during the synchronization
- **Message**: a more descriptive message about the synchronization status
- **Last Sync**: the date and time of the last synchronization
- **Last Commit**: the commit hash of the last synchronization
- **Version**: the version of the Domain Snapshot

* * *
#### FAQ

##### - Can I use the same repository for multiple Domains?
Yes, you can use the same repository for multiple Domains. You just need to create a directory for each Domain and configure the synchronization settings for each Domain.

##### - Can I allow other users to manage this integration?
Yes, you need to include the user in a team that has [ADMIN: UPDATE] permission in the Domain.

#####  - Can I create a new account using an existing repository previously synchronized with another account?
Yes, but be aware that the repository snapshot will take precedence over the Domain account. So, if you have a different configuration in the repository, it will be applied to the account.

##### - What is the order of precedence when synchronizing?
Switcher GitOps will determine if the account is out of sync when either of the following conditions is met:
- Last commit is empty (first synchronization)
- Last commit is different from the repository (repository has changes)
- Domain Snapshot version is different from the repository (Domain Snapshot has changes)
- Account status is different than Synced

Then it will check the changes if:
- Domain Snapshot version is higher than the repository, then it will update the repository
- Or else, it will update the Domain Snapshot

##### - Can my changes in the repository be overwritten?
Yes, if you push changes to the repository and modify the Domain using the Switcher API Management or Slack App, the changes in the repository will be overwritten.

This is made intentionally to preserve immediate changes made in the Domain to take precedence over the repository.

##### - Can I recover or copy the token after the account is created?
No, the token is encrypted and stored securely.

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[gitops.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 