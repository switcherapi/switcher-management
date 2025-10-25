<img src="[$ASSETS_LOCATION]documentation/images/slack/switcher_slack_app_logo.png" class="image-style center width-70 dark-invert" alt=""/><p>

#### Change Request
* * *

The Change Request feature is a powerful tool that allows you to request changes in your features and environments directly from Slack. This feature is available for all users that have access to the Workspace and provides a fast and powerful input to organizations to evaluate and perform changes.

##### **Creating a Ticket**

To create a ticket you just need to provide the necessary details such as Domain, Environment, Feature Group, Switcher name and status.<br>
It is also possible to select Group Features to toggle multiple features at once.

<img src="[$ASSETS_LOCATION]documentation/images/slack/change_request_modal.png" class="image-style center dark-invert" alt=""/><p>

</br></br>

##### **Ticket Review**

After defining the attributes of your ticket, you can review and add an observation that is useful to give more details about the change request.<br>
The app can also identify if a ticket already exists and republish it to the approval channel. Validations are also executed to make sure that the change request is valid.

<img src="[$ASSETS_LOCATION]documentation/images/slack/change_request_review.png" class="image-style center dark-invert" alt=""/><p>

</br></br>

##### **Ticket evaluation**

When submitted, the ticket is automatically published to the approval channel, where the approvers can review and approve or deny the change request.<br>
Once the ticket is approved or denied, the message is updated with the action taken, and the event is sent to Switcher API.

<img src="[$ASSETS_LOCATION]documentation/images/slack/change_request_approval.png" class="image-style center dark-invert" alt=""/><p>

</br></br>

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[slack_features.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]github.svg" style="width: 30px;">
</a> 