#### Overview

Switcher Relay is a message wrapper that can invoke an external REST service in order to either process the result or just notify that an execution has been made.
Not only can applications make use of all the built-in strategy validations, but they can also create a customized and totally independent mechanisms to manipulate software behavior.

This document will show you the different ways you can configure it and how to implement the REST API receptor, which will be responsible for receiving and processing the information provided by the Switcher Relay.

<img src="[$ASSETS_LOCATION]/documentation/images/relay/macro_relay.jpg" class="image-style center width-70" alt=""/><p>

* * *

#### How to use

Below you will learn how to configure a Switcher Relay and its results after it is completed.

1. Adding a Relay

  After creating a Switcher, you can add one Relay per-environment by clicking on *Add Relay*. A new view will be showed right below your switcher main view. This panel must contains all the related information regarding how to access your REST receptor.

  <img src="[$ASSETS_LOCATION]/documentation/images/relay/relay_setup.jpg" class="image-style shadow" alt=""/><p>

  This view is composed by the settings:

  - **Relay Type**:

    It defines if your REST receptor will be responsible for *VALIDATION* or just *NOTIFICATION*. The difference is that when executing the switcher criteria, validation relays will wait for a response given by the REST receptor, while notification relays are triggered but it does not wait for a response.

  - **Description**:

    Add here a short description of what exactly this relay is for. It can be useful for easy traceability and the purpose of the configured feature switcher.

  - **Endpoint** - Multi-environment:

    Define here the URL that will be called by the switcher relay.

  - **Relay Method**:

    The two available methods are GET and POST. The difference besides the method used to call the REST receptor is that when using GET, inputs are going to be placed as query parameters and when using POST, inputs are going to be sent via request body.

  - **Authorization Prefix**:

    This configuration is responsible for building the header by adding an Authorization element. The prefix is going to be placed at the start of the value. A common prefix used for the authorization header is *Bearer*, which is proceeded by a token value.

  - **Authorization Token** - Multi-environment:

    This value is combined with the Authorization Prefix that will compose the Authorization header.


2. Implementing the API receptor

  Before getting into the coding examples, it is important to understand how the Switcher Relay will wrap the request and then send the request to the receptor.

  When using one of the Switcher Libraries to access the API, the input provided for validating strategies are the only input necessary you need to process on the switcher relay. For easy understanding on how strategies input are built to compose the request wrapper, below you will see a description of all strategies validation field and how it will translate to the wrapper.

    - VALUE_VALIDATION: value
    - NUMERIC_VALIDATION: numeric
    - NETWORK_VALIDATION: network
    - TIME_VALIDATION: time
    - DATE_VALIDATION: date
    - REGEX_VALIDATION: regex

    For example, if you call a switcher using the Java example below:

    ```java
    Switcher switcher = SwitcherFactory.getSwitcher("FEATURE01")
          .prepareEntry(new Entry(Entry.VALUE, "Roger"))
          .prepareEntry(new Entry(Entry.NETWORK, "10.0.0.3"));
        
    switcher.isItOn();
    ```

    Considering that **FEATURE01** has a configured relay to access the endpoint <a style="text-decoration: none; color: black; cursor: default">https://myapi/validate</a>. The wrapper will be sending to this receptor the following parameter:

    <li style="list-style-type: disclosure-closed;">If the method equals to [GET] > https://myapi/validate?value=Roger&network=10.0.0.3
    <li style="list-style-type: disclosure-closed;">If the method equals to [POST] > https://myapi/validate { body: value: 'Roger', network: '10.0.0.3' }
    </br></br>

    ##### Code example
    Using the example above, a simple implementation of a relay receptor using NodeJS/Express can be done as the example below.

    The response when implementing a *NOTIFICATION* receptor service must contain the following return arguments:
    <li style="list-style-type: disclosure-closed;">result: boolean
    <li style="list-style-type: disclosure-closed;">message: string (optional argument)
    </br></br>

```javascript
router.post('/validate', (req, res) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!validateToken(token)) {
          return res.status(401).send({
            result: false,
            message: `Invalid token`
          });
        }

        if (!validateArguments(req.body.value, req.body.network)) {
          return res.send({
            result: false,
            message: `Invalid user name '${req.body.value}' for ${req.body.network} network address`
          });
        }

        res.send({
            result: true
        });
    } catch (e) {
        res.status(500).send();
    }
})
```

3. Stacking

  This approach allows you to determine whether the relay has to be executed or not. It consists of adding strategy validations before invoking the relay.
  The advantages of this approach are pre-filtering requests and eliminating unnecessary calls to your receptor that might not be valid for the implemented business rule.

  Defining strategies before Relays are the best way to keep the consistency of all external validation. It creates a smart gateway between your application and the external API used to validate or being notified. 

  <img src="[$ASSETS_LOCATION]/documentation/images/relay/macro_stack.jpg" class="image-style center width-70" alt=""/><p>

#### Metrics

  Below you can access the result given a possible execution of this validation made via Switcher Relay where the user on the context is not allowed to access the feature.

  <img src="[$ASSETS_LOCATION]/documentation/images/relay/relay_datametrics.jpg" class="image-style shadow" alt=""/><p>

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[relay.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a>