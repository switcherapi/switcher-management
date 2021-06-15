#### Overview
* * *

Find here all the necessary steps to install Switcher Slack App to your Slack Workspace.

The app was developed primarily to improve visibility and actions taken by your team, hence, in order to provide a secure and restricted environment, the app installation requires that the Domain owner acknowledge the necessary permissions to both Slack and Switcher API interact with each other.

<img src="[$ASSETS_LOCATION]/documentation/images/slack/switcherapi_slack_banner.png" class="image-style center width-70" alt=""/><p>

#### Requirements
* * *

The installation process will require that you are logged as Slack Workspace administrator and also logged to Switcher Management as Domain owner.</br>
The two requirements are necessary to assure that only administrator users can include, modify or uninstall the Slack App.</br>
Make sure you have a channel created beforehand that will be used to publish all change requests. This channel must be selected during the Slack Authorization step.

#### Installing
* * *

##### 1. **Install Slack App**

After being logged to the Switcher Management, select the Domain that you want to link your Slack Workspace then select the drill down located at the upper right of the Domain detail view.

<img src="[$ASSETS_LOCATION]/documentation/images/slack/install/slack_install.jpg" class="image-style center shadow" alt=""/><p>

</br></br>

##### 2. **Add to Slack**

A new page will be loaded to confirm that you want to add the Slack App to your workspace.</br>
When this page is loaded, a temporary token access is generated under the hood that will be linked later on with the installation.

<img src="[$ASSETS_LOCATION]/documentation/images/slack/install/slack_app_install.jpg" class="image-style center shadow" alt=""/><p>

</br></br>

##### 3. **Slack Authorization**

When you install any app to your Slack Workspace, it is required that all applications show the necessary access that is needed to the app interact with it.</br>
Switcher Slack App works with minimum access to Workspaces as shown in the image below, but we need the administrator's consent to proceed with the installation.

After verifying all accesses and permissions, select the channel in which the app will use to publish change requests.</br>

<img src="[$ASSETS_LOCATION]/documentation/images/slack/install/slack_app_auth.jpg" class="image-style center shadow" alt=""/><p>

</br></br>

##### 4. **Switcher API Authorization**

As well as for Switcher API, it requires you to authorize that Slack App can perform requests to the API through the platform.</br>
The two-hands shaking guarantee that both platforms can interact with each other. 

<img src="[$ASSETS_LOCATION]/documentation/images/slack/install/slack_switcher_auth.jpg" class="image-style center shadow" alt=""/><p>

</br></br>

##### 5. **Add to Workspace**

Now that both platforms are linked, you can add the app to your workspace by selecting Add app on your sidebar, then selecting Switcher API.

<img src="[$ASSETS_LOCATION]/documentation/images/slack/install/ext_slack_select_app.jpg" class="image-style center shadow" alt=""/><p>

</br>

After selecting the app, the Home view will load with all available features.

<img src="[$ASSETS_LOCATION]/documentation/images/slack/install/ext_slack_home.jpg" class="image-style center shadow" alt=""/><p>

</br></br>

##### 6. **App Settings**

The last step consists of including the app in the channel that was chosen during the Slack Authorization step.</br>
To add the channel, you can click on the app title at the Home view. It will open the app settings view.

<img src="[$ASSETS_LOCATION]/documentation/images/slack/install/ext_slack_settings.jpg" class="image-style center shadow" alt=""/><p>

Select the channel using the drill down box, then click on Add.

<img src="[$ASSETS_LOCATION]/documentation/images/slack/install/ext_slack_settings_channel.jpg" class="image-style center shadow" alt=""/><p>

</br></br>

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[slack_installation.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 