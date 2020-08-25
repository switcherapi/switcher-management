#### Switcher Management Quickstart

The 5 steps show the minimum configuration necessary to start using Switcher API on your projects.
</br>As you complete all these steps, take a look at the Java or JavaScript modules to start setting up your application to communicate with the Switcher API.

<img src="[$ASSETS_LOCATION]/documentation/images/setup/5steps.jpg" class="image-style shadow" alt=""/><p>

* * *

##### 1. Sign up
Connect to Switcher Management signing up using either email or a GitHub account.

##### 2. Domain
This is going to be your workspace which will contain:
- All your projects
- Switchers to toggle features
- Metrics
- Environment and application settings
- Team management

<img src="[$ASSETS_LOCATION]/documentation/images/setup/domain_create.jpg" class="image-style shadow" alt=""/><p><br/>

##### 3. Component
Configure here all your projects/applications that will make use of this API. This step is required for you to keep track of everything and access Switcher API.
<p>After registering your component, it will be available for you to link with any switcher.

<img src="[$ASSETS_LOCATION]/documentation/images/setup/components.jpg" class="image-style shadow" alt=""/><p><br/>

<p>At the end of this step, you'll be given an API Key that will be used exclusively for the registered component. 
For security purposes, this key cannot be reclaimed, so keep it in a safe place.

<img src="[$ASSETS_LOCATION]/documentation/images/components/component_key.jpg" class="image-style shadow" alt=""/><p><br/>

##### 4. Group
Let's now create a group for all your features. This place is great for you to define projects and releases.
<br>With groups you can easily manage and change multiple switchers at once.

Examples of usage:

- Critical rollback when multiple applications must be recovered to their previous state
- Organizing features as releases or even long-term toggles.

##### 5. Switcher
Finally, define your switcher by giving a key value and a brief description.
<br/>When typing the key name the auto-pattern formatter will assist you to follow the criteria below.

- All caps
- Alphanumeric
- No spaces


<img src="[$ASSETS_LOCATION]/documentation/images/setup/switchers.jpg" class="image-style shadow" alt=""/>

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[setup.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 
