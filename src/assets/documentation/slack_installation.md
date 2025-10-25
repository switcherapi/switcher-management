#### Overview
* * *

Find here all the necessary steps to install **Switcher Slack App** to your Slack Workspace.

The app was developed primarily to improve visibility and actions taken by your team, hence, in order to provide a secured environment, the app installation requires that the Domain owner acknowledge the necessary permissions to both Slack and Switcher API to work properly.

<img src="[$ASSETS_LOCATION]documentation/images/slack/switcherapi_slack_banner.png" class="image-style center width-70 dark-invert" alt=""/><p>

#### Requirements
* * *

The installation process will require that you are logged as Slack Workspace administrator and also logged to Switcher Management as Domain owner.</br>
The two requirements are necessary to ensure that only administrator users can install or modify the Slack App.</br>
Make sure you have a channel created beforehand which will be used to publish change requests. This channel must be selected during the Slack Authorization step.


##### 1. **Install Slack App**

To start the installation process, you can find the installation button on any Domain Details view under the toolbar menu.</br>
Clicking on the Install Slack App will not yet link the installation with the current Domain, but it will start the installation process.

<img src="[$ASSETS_LOCATION]documentation/images/slack/install/slack_install.jpg" class="image-style center shadow dark-invert" alt=""/><p>

</br></br>

##### 2. **Add to Slack**

A new page will be shown to confirm that you want to add the Slack App to your workspace.</br>
When this page is loaded, a temporary token access is generated to link the installation with the a Doamin to be selected in the step 4.

<img src="[$ASSETS_LOCATION]documentation/images/slack/install/slack_app_install.jpg" class="image-style center shadow dark-invert" alt=""/><p>

</br></br>

##### 3. **Slack Authorization**

When you install any app to your Slack Workspace, it is required that all applications show the necessary access that is required to work properly.</br>
Switcher Slack App works with minimum access to Workspaces. Current scopes are `"chat:write", "commands", "incoming-webhook"`.

After verifying all accesses and permissions, select the channel in which the app will use to publish change requests.</br>

<img src="[$ASSETS_LOCATION]documentation/images/slack/install/slack_app_auth.jpg" class="image-style center shadow dark-invert" alt=""/><p>

</br></br>

##### 4. **Switcher API Authorization**

Switcher API also requires you to authorize that Slack App can perform requests to the API through the platform.</br>
The two-hands shaking guarantee that both platforms can interact with each other.</br>
As mentioned before in the step 2, you will be prompted to select a Domain to link the Slack App installation (only available Domains will be shown).

<img src="[$ASSETS_LOCATION]documentation/images/slack/install/slack_switcher_auth.jpg" class="image-style center shadow dark-invert" alt=""/><p>

</br></br>

##### 5. **Add to Workspace & Channel**

Now that both platforms are linked, you can see that a new integration was added to the channel.

<img src="[$ASSETS_LOCATION]documentation/images/slack/install/ext_slack_installed_message.png" class="image-style center shadow dark-invert" alt=""/><p>

Click on the **Switch API** link to first add the app to the channel so messages can be published from the Switcher Slack App.</br>
Once that is completed, you can click on the **Go to App** to open the Switcher Slack App and start using it.


<img src="[$ASSETS_LOCATION]documentation/images/slack/install/ext_slack_installed_add_channel.png" class="image-style center shadow dark-invert" alt=""/><p>


* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[slack_installation.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]github.svg" style="width: 30px;">
</a> 