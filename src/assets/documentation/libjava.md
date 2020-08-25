[![Build Status](https://travis-ci.com/switcherapi/switcher-client.svg?branch=master)](https://travis-ci.com/switcherapi/switcher-client)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=switcher-client-java&metric=alert_status)](https://sonarcloud.io/dashboard?id=switcher-client-java)
[![Known Vulnerabilities](https://snyk.io/test/github/switcherapi/switcher-client/badge.svg?targetFile=pom.xml)](https://snyk.io/test/github/switcherapi/switcher-client?targetFile=pom.xml)
[![Maven Central](https://img.shields.io/maven-central/v/com.github.switcherapi/switcher-client.svg?label=Maven%20Central)](https://search.maven.org/search?q=g:%22com.github.switcherapi%22%20AND%20a:%22switcher-client%22)
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
- Maven
```xml
<dependency>
    <groupId>com.github.switcherapi</groupId>
    <artifactId>switcher-client</artifactId>
    <version>1.0.6</version>
</dependency>
```

</br>

##### - Context properties
The context map properties stores all information regarding connectivity and strategy settings. These constants can be accessed using *SwitcherContextParam*.

- URL: Endpoint of your Swither-API - e.g. https://switcher-load-balance.herokuapp.com.
- APIKEY: Switcher-API key generated after creating a domain.
- DOMAIN: Domain name.
- COMPONENT: Application name.
- ENVIRONMENT: Environment name. Production environment is named as 'default'.
- SILENT_MODE: (boolean) Activate contingency in case of some problem with connectivity with the API.
- RETRY_AFTER: Time given to the module to re-establish connectivity with the API - e.g. 5s (s: seconds - m: minutes - h: hours)
- SNAPSHOT_LOCATION: Set the folder location where snapshot files will be saved.
- SNAPSHOT_AUTO_LOAD: (boolean) Set the module to automatically download the snapshot configuration.

All set, you can now build the context.
```java
SwitcherFactory.buildContext(properties, false);
```

</br>

##### - Executing
There are a few different ways to call the API using the java library.
</br>Here are some examples:

1. **No parameters**

  Invoking the API can be done by obtaining the switcher object and calling *isItOn*. It can also be forced to call another key any time you want.
  ```java
  Switcher switcher = SwitcherFactory.getSwitcher("FEATURE01");
  switcher.isItOn();
  //or
  switcher.isItOn("FEATURE01");
  ```

2. **Strategy validation - preparing input**

  Loading values into the switcher can be done by using *prepareEntry*, in case you want to include input from a different place of your code. Otherwise, it is also possible to include everything in the same call.
  ```java
  List<Entry> entries = new ArrayList<>();
  entries.add(new Entry(Entry.DATE, "2019-12-10"));
  entries.add(new Entry(Entry.DATE, "2020-12-10"));
  
  switcher.prepareEntry(entries);
  switcher.isItOn();
  //or
  switcher.isItOn(entries);
  ```

  Strategy validators can be specified as:
  - Entry.DATE: Date validation
  - Entry.TIME: Time validation
  - Entry.VALUE: Plain text validation
  - Entry.NUMERIC: Numeric validation
  - Entry.NETWORK: IP/range validation
  - Entry.REGEX: Regular expression validation


3. **Strategy validation - chained call**

  Create chained calls using 'prepareEntry' functions one by one.
  ```java
  Switcher switcher = SwitcherFactory.getSwitcher("FEATURE01")
        .prepareEntry(new Entry(Entry.VALUE, "My value"))
        .prepareEntry(new Entry(Entry.NETWORK, "10.0.0.1"));
			
	switcher.isItOn();
  ```

4. **Strategy validation - all-in-one execution**

  All-in-one method is fast and include everything you need to execute a complex call to the API. Stack inputs changing the last parameter to *true* in case you need to add more values to the strategy validator.
  ```java
  switcher.isItOn("FEATURE01", new Entry(Entry.NETWORK, "10.0.0.3"), false);
  ```

5. **Accessing the response history**

  Switchers when created store the last execution result from a given switcher key. This can be useful for troubleshooting or internal logging.
  ```java
  switcher.getHistoryExecution();
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
Write automated tests using this built-in mock mechanism to guide your test scenario according to what you want to test.
</br>*SwitcherExecutor* implementation has 2 methods that can make mock tests easier. Use assume to force a value to a switcher and forget to reset its original state.

```java
Switcher switcher = SwitcherFactory.getSwitcher("FEATURE01");

SwitcherExecutor.assume("FEATURE01", false);
switcher.isItOn(); // 'false'

SwitcherExecutor.forget("FEATURE01");
switcher.isItOn(); // Now, it's going to return the result retrieved from the API or the Snaopshot file
```

</br>

### Version Log
- 1.0.7: Added Regex Validation
- 1.0.6: Updated depencencies & new features
	- Updated dependency jersey-hk2 from 2.28 to 2.31
	- Updated dependency commons-net from 3.3 to 3.6.
	- Updated dependency commons-lang3 from 3.8.1 to 3.10.
	- Updated dependency gson from 2.8.5 to 2.8.6.
	- Added execution log to Switcher.
	- Added bypass metrics and show detailed criteria evaluation options to Switcher objects.
- 1.0.5: Security patch - Jersey has been updated - 2.28 to 2.31
- 1.0.4: Added Numeric Validation
- 1.0.3: Security patch - Log4J has been updated - 2.13.1 to 2.13.3
- 1.0.2: 
    - Improved performance when loading snapshot file.
    - Snapshot file auto load when updated.
    - Re-worked built-in mock implementation
- 1.0.1: Security patch - Log4J has been updated
- 1.0.0: Working release

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[libjava.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 