[![Build Status](https://travis-ci.com/switcherapi/switcher-client-master.svg?branch=master)](https://travis-ci.com/github/switcherapi/switcher-client-master)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=switcherapi_switcher-client-master&metric=alert_status)](https://sonarcloud.io/dashboard?id=switcherapi_switcher-client-master)
[![Coverage Status](https://coveralls.io/repos/github/switcherapi/switcher-client-master/badge.svg?branch=master)](https://coveralls.io/github/switcherapi/switcher-client-master?branch=master)
[![npm version](https://badge.fury.io/js/switcher-client.svg)](https://badge.fury.io/js/switcher-client)
[![Known Vulnerabilities](https://snyk.io/test/github/switcherapi/switcher-client-master/badge.svg?targetFile=package.json)](https://snyk.io/test/github/switcherapi/switcher-client-master?targetFile=package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

### Features
- Flexible and robust functions that will keep your code clean and maintainable.
- Able to work offline using a snapshot file downloaded from your remote Switcher-API Domain.
- Silent mode is a hybrid configuration that automatically enables a contingent sub-process in case of any connectivity issue.
- Built-in mock implementation for clear and easy implementation of automated testing.
- Easy to setup. Switcher Context is responsible to manage all the complexity between your application and API.

* * *

### Usage

##### - Install  
`npm install switcher-client`

</br>

##### - Module initialization
The context properties stores all information regarding connectivity and strategy settings.

```js
const Switcher = require("switcher-client");

const apiKey = 'API Key';
const environment = 'default'; // Production = default
const domain = 'My Domain';
const component = 'MyApp';
const url = 'https://switcher-load-balance.herokuapp.com';
```

- **apiKey**: Switcher-API key generated after creating a domain..
- **environment**: Environment name. Production environment is named as 'default'.
- **domain**: Domain name.
- **component**: Application name.
- **url**: Swither-API endpoint.

##### - Options
You can also activate features such as offline and silent mode:

```js
const offline = true;
const snapshotLocation = './snapshot/';
const silentMode = true;
const retryAfter = '5m';

let switcher = new Switcher(url, apiKey, domain, component, environment, {
      offline, snapshotLocation, silentMode, retryAfter
});
```

- **offline**: If activated, the client will only fetch the configuration inside your snapshot file. The default value is 'false'.
- **snapshotLocation**: Location of snapshot files. The default value is './snapshot/'.
- **silentMode**: If activated, all connectivity issues will be ignored and the client will automatically fetch the configuration into your snapshot file.
- **retryAfter** : Time given to the module to re-establish connectivity with the API - e.g. 5s (s: seconds - m: minutes - h: hours).

</br>

##### - Executing
There are a few different ways to call the API using the JavaScript module.
Here are some examples:

1. **No parameters**
Invoking the API can be done by instantiating the switcher and calling *isItOn* passing its key as a parameter.
```js
const switcher = new Switcher(url, apiKey, domain, component, environment);
await switcher.isItOn('FEATURE01');
```

2. **Promise**
Using promise is another way to call the API if you want, like:
```js
switcher.isItOnPromise('KEY')
    .then(result => console.log('Result:', result))
    .catch(error => console.log(error));
```

3. **Strategy validation - preparing input**
Loading information into the switcher can be made by using *prepare*, in case you want to include input from a different place of your code. Otherwise, it is also possible to include everything in the same call.
```js
switcher.prepare('FEATURE01', [Switcher.StrategiesType.VALUE, 'USER_1');
switcher.isItOn();
```

4. **Strategy validation - all-in-one execution**
All-in-one method is fast and include everything you need to execute a complex call to the API.
```js
await switcher.isItOn('FEATURE01',
    [Switcher.StrategiesType.VALUE, 'User 1', 
    Switcher.StrategiesType.NETWORK, '192.168.0.1']
);
```

</br>

##### - Offline settings
You can also force the Switcher library to work offline. In this case, the snapshot location must be set up and the context re-built using the offline flag.

```java
properties.put(SwitcherContextParam.SNAPSHOT_LOCATION, "/src/resources");
SwitcherFactory.buildContext(properties, true);
```

</br>

##### - Built-in mock feature
You can also bypass your switcher configuration by invoking 'Switcher.assume'. This is perfect for your test code where you want to test both scenarios when the switcher is true and false.

```js
Switcher.assume('FEATURE01').true();
switcher.isItOn('FEATURE01'); // true

Switcher.forget('FEATURE01');
switcher.isItOn('FEATURE01'); // Now, it's going to return the result retrieved from the API or the Snaopshot file
```

##### - Snapshot version check
For convenience, an implementation of a domain version checker is available if you have external processes that manage snapshot files.

```js
switcher.checkSnapshot();
```

* * *

### Version Log

- 2.0.2: Added a built-in execution logger
- 2.0.0:
    - Improved performance when loading snapshot file.
    - Snapshot file auto load when updated.
    - Re-worked built-in mock implementation
- 1.0.0: Working release

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[libjavascript.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 