***

<div align="center">
<b>Switcher Client SDK</b><br>
A JavaScript SDK for Switcher API
</div>

***

### Features
- Flexible and robust functions that will keep your code clean and maintainable.
- Able to work locally using a snapshot file downloaded from your remote Switcher-API Domain.
- Silent mode is a hybrid configuration that automatically enables a contingent sub-process in case of any connectivity issue.
- Built-in stub implementation for clear and easy implementation of automated testing.
- Easy to setup. Switcher Context is responsible to manage all the complexity between your application and API.

* * *

### Usage

##### - Install  
`npm install switcher-client`

</br>

##### - Module initialization
The context properties stores all information regarding connectivity.

```js
import { Client } from 'switcher-client';

const apiKey = '[API_KEY]';
const environment = 'default';
const domain = 'My Domain';
const component = 'MyApp';
const url = 'https://api.switcherapi.com';
```

- **domain**: Domain name.
- **url**: (optional) Swither-API endpoint.
- **apiKey**: (optional) Switcher-API key generated to your component.
- **component**: (optional) Application name.
- **environment**: (optional) Environment name. Production environment is named as 'default'.

##### - Options
You can also activate features such as local and silent mode:

```js
const local = true;
const freeze = true;
const logger = true;
const snapshotLocation = './snapshot/';
const snapshotAutoUpdateInterval = 3;
const snapshotWatcher = true;
const silentMode = '5m';
const restrictRelay = true;
const certPath = './certs/ca.pem';

Client.buildContext({ url, apiKey, domain, component, environment }, {
    local, freeze, logger, snapshotLocation, snapshotAutoUpdateInterval, 
    snapshotWatcher, silentMode, restrictRelay, certPath
});

const switcher = Client.getSwitcher();
```

- **local**: If activated, the client will only fetch the configuration inside your snapshot file. The default value is 'false'
- **freeze**: If activated, prevents the execution of background cache update when using throttle. The default value is 'false'
- **logger**: If activated, it is possible to retrieve the last results from a given Switcher key using Client.getLogger('KEY')
- **snapshotLocation**: Location of snapshot files
- **snapshotAutoUpdateInterval**: Enable Snapshot Auto Update given an interval in seconds (default: 0 disabled)
- **snapshotWatcher**: Enable Snapshot Watcher to monitor changes in the snapshot file (default: false)
- **silentMode**: Enable contigency given the time for the client to retry - e.g. 5s (s: seconds - m: minutes - h: hours)
- **restrictRelay**: Enable Relay Restriction - Allow managing Relay restrictions when running in local mode (default: true)
- **regexSafe**: Enable REGEX Safe mode - Prevent agaist reDOS attack (default: true)
- **regexMaxBlackList**: Number of entries cached when REGEX Strategy fails to perform (reDOS safe) - default: 50
- **regexMaxTimeLimit**: Time limit (ms) used by REGEX workers (reDOS safe) - default - 3000ms
- **certPath**: Path to the certificate file used to establish a secure connection with the API

(*) regexSafe is a feature that prevents your application from being exposed to a reDOS attack. It is recommended to keep this feature enabled.<br>

</br>

##### - Executing
There are a few different ways to call the API.
Here are some examples:

1. **Basic usage**
Some of the ways you can check if a feature is enabled or not.

```js
const switcher = Client.getSwitcher();

// Local (synchronous) execution
const isOnBool = switcher.isItOn('FEATURE01'); // true or false
const isOnBool = switcher.isItOnBool('FEATURE01'); // true or false
const isOnDetail = switcher.detail().isItOn('FEATURE01'); // { result: true, reason: 'Success', metadata: {} }
const isOnDetail = switcher.isItOnDetail('FEATURE01'); // { result: true, reason: 'Success', metadata: {} }

// Remote (asynchronous) execution or hybrid (local/remote) execution
const isOnBoolAsync = await switcher.isItOn('FEATURE01'); // Promise<boolean>
const isOnBoolAsync = await switcher.isItOnBool('FEATURE01', true); // Promise<boolean>
const isOnDetailAsync = await switcher.detail().isItOn('FEATURE01'); // Promise<SwitcherResult>
const isOnDetailAsync = await switcher.isItOnDetail('FEATURE01', true); // Promise<SwitcherResult>
```

2. **Strategy validation - preparing input**
Loading information into the switcher can be made by using *prepare*, in case you want to include input from a different place of your code. Otherwise, it is also possible to include everything in the same call.

```js
await switcher.checkValue('USER_1').prepare('FEATURE01');
await switcher.isItOn();
```

3. **Strategy validation - all-in-one execution**
All-in-one method is fast and include everything you need to execute a complex call to the API.

```js
await switcher
    .defaultResult(true)    // Default result to be returned in case of no API response
    .throttle(1000)         // Throttle the API call to improve performance
    .checkValue('User 1')
    .checkNetwork('192.168.0.1')
    .isItOn('FEATURE01');
```

4. **Throttle**
Throttling is useful when placing Feature Flags at critical code blocks that require zero-latency.
API calls will be scheduled to be executed after the throttle time has passed.

```js
const switcher = Client.getSwitcher();
await switcher
    .throttle(1000)
    .isItOn('FEATURE01');
```

In order to capture issues that may occur during the process, it is possible to log the error by subscribing to the error events.

```js
Client.subscribeNotifyError((error) => {
    console.log(error);
});
```

5. **Hybrid mode**
Forcing Switchers to resolve remotely can help you define exclusive features that cannot be resolved locally.
This feature is ideal if you want to run the SDK in local mode but still want to resolve a specific switcher remotely.

A particular use case is when a swithcer has a Relay Strategy that requires a remote call to resolve the value.

```js
const switcher = Client.getSwitcher();
await switcher.remote().isItOn('FEATURE01');
```

</br>
## Built-in stub feature
You can also bypass your switcher configuration with 'Client.assume' API. This is perfect for your test code where you want to validate both scenarios when the switcher is true and false.

```js
Client.assume('FEATURE01').true();
switcher.isItOn('FEATURE01'); // true

Client.forget('FEATURE01');
switcher.isItOn('FEATURE01'); // Now, it's going to return the result retrieved from the API or the Snaopshot file

Client.assume('FEATURE01').false().withMetadata({ message: 'Feature is disabled' }); // Include metadata to emulate Relay response
const response = await switcher.detail().isItOn('FEATURE01'); // false
console.log(response.metadata.message); // Feature is disabled

Client.assume('FEATURE01').true().when(StrategiesType.VALUE, 'USER_1');
switcher.checkValue('USER_1').isItOn('FEATURE01'); // true when the value is 'USER_1'

Client.assume('FEATURE01').true().when(StrategiesType.NETWORK, ['USER_2', 'USER_3']);
switcher.checkValue('USER_1').isItOn('FEATURE01'); // false as the value is not in the list
```

**Enabling Test Mode**
You may want to enable this feature while using Switcher Client with automated testing.
It prevents the Switcher Client from locking snapshot files even after the test execution.

To enable this feature, it is recommended to place the following on your test setup files:
```js
Client.testMode();
```

**Smoke Test**
Validate Switcher Keys on your testing pipelines before deploying a change.
Switcher Keys may not be configured correctly and can cause your code to have undesired results.

This feature will validate using the context provided to check if everything is up and running.
In case something is missing, this operation will throw an exception pointing out which Switcher Keys are not configured.
```js
Client.checkSwitchers(['FEATURE01', 'FEATURE02'])
```

##### Loading Snapshot from the API
This step is optional if you want to load a copy of the configuration that can be used to eliminate latency when local mode is activated.<br>
Activate watchSnapshot optionally passing true in the arguments.<br>
Auto load Snapshot from API passing true as second argument.

```js
Client.loadSnapshot();
```

##### Watch for Snapshot file changes
Activate and monitor snapshot changes using this feature. Optionally, you can implement any action based on the callback response.

```js
Client.watchSnapshot({
    success: () => console.log('In-memory snapshot updated'),
    reject: (err) => console.log(err)
});
```

Alternatively, you can also use the client context configuration to monitor changes in the snapshot file.<br>

```js
Client.buildContext({ domain, component, environment }, {
    local: true,
    snapshotLocation: './snapshot/',
    snapshotWatcher: true
});
```

##### - Snapshot version check
For convenience, an implementation of a domain version checker is available if you have external processes that manage snapshot files.

```js
Client.checkSnapshot();
```

##### Snapshot Update Scheduler
You can also schedule a snapshot update using the method below.<br>
It allows you to run the Client SDK in local mode (zero latency) and still have the snapshot updated automatically.

```js
Client.scheduleSnapshotAutoUpdate(3000, {
    success: (updated) => console.log('Snapshot updated', updated),
    reject: (err) => console.log(err)
});
```

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[libjavascript.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 