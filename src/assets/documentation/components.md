#### Overview
Components are registered applications that will be making use of switchers.
</br>The idea behind this configuration is to track every call from the module API so we can elaborate on a more detailed analysis about switchers usage.

Regarding security, all registered applications must be linked to a switcher, otherwise, the call will return an unauthorized access.
</br>This new layer of security was created to prevent other applications to use not related switchers.

<img src="[$ASSETS_LOCATION]/documentation/images/components/component.jpg" class="image-style shadow" alt=""/><p>

* * *

#### Usage
Creating a components is very simple and after doing it, you just have to link it with one or more switchers you have already created and add to your application module context.

1. Linking with a Switcher

  Enter in the edition mode and just type the name of your registered component. 
  </br>It will try to match in an auto-complete list for you to choose afterwards.

  <img src="[$ASSETS_LOCATION]/documentation/images/components/component_add.jpg" class="image-style shadow" alt=""/><p>

2. Including into your application module context

  Here it is an example of a NodeJS Express-based application context named as 'IventoryWS'.

  ```js
  function setupContext() {
      const apiKey = process.env('API_KEY')
      const domain = 'My Domain'
      const component = 'InventoryWS'
      const environment = 'default'
      const url = 'http://localhost:3000'

      switcher = new Switcher(url, apiKey, domain, component, environment, {
          offline: true
      })
  }
  ```

  * * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[components.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 