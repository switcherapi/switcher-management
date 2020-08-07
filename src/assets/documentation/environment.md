#### Overview
You can benefit from working with different environments when using Switcher API. 
</br>Here are some advantages:

- Decrease the impact of your either productive or other sensitive environments when switching features.
- Set up exclusive variables (strategies) that will be used to run the switcher criteria.

<img src="[$ASSETS_LOCATION]/documentation/images/environment/environment.jpg" class="image-style shadow" alt=""/><p>

* * *

#### Usage
After registering a new environment, it will become available as an option for:
- Domains
- Groups
- Switchers
- Strategies
- Snapshot download (for zero-latency library usage)

<img src="[$ASSETS_LOCATION]/documentation/images/environment/env_selection.jpg" class="image-style" alt=""/>

**default** is your productive environment

Environment settings can be also be reset using two different options.

1. Removing the environment setting inside your Domain, Group, Switcher, or Strategy, by selecting the trach icon.
In case your application uses the removed environment, then it will automatically use the default environment settings.

  <img src="[$ASSETS_LOCATION]/documentation/images/environment/env_remove.jpg" class="image-style shadow" alt=""/><p>

2. Resetting the entire environment to use the default settings. This action will also remove strategies since they are created per environment.

  <img src="[$ASSETS_LOCATION]/documentation/images/environment/env_reset.jpg" class="image-style shadow" alt=""/><p></br>

#### Environment Snapshot file
When using the provided modules to connect to the Switcher API, it is also possible to opt for accessing all configuration made inside Switcher Management via a snapshot configuration file. This file is generated in JSON and can be download by selecting the icon on the top of your Domain panel.

<img src="[$ASSETS_LOCATION]/documentation/images/environment/snapshot_location.jpg" class="image-style shadow"/><p>

  Snapshots can be downloaded by selecting the environment and one of the optional configurations.
  </br>It is also possible to configure the module to auto-update this snapshot locally. This setting is useful when working with critical services that cannot depend on network latency.

  Snapshots as Domain are internally versioned, it means that every modification generates a new version that will be used to identify when a local snapshot file must be updated.

```json
{
  "domain": {
    "name": "My Domain",
    "version": 1591510059350,
    "activated": true,
    "group": [
      {
        "name": "Release 1",
        "activated": true,
        "config": [
          {
            "key": "FEATURE01",
            "activated": true,
            "strategies": [],
            "components": [
              "CustomerAPI",
              "InventoryWS"
...
```