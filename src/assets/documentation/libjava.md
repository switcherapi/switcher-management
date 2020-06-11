[![Build Status](https://travis-ci.com/petruki/switcher-client.svg?branch=master)](https://travis-ci.com/petruki/switcher-client)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=switcher-client-java&metric=alert_status)](https://sonarcloud.io/dashboard?id=switcher-client-java)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Maven Central](https://img.shields.io/maven-central/v/com.github.petruki/switcher-client.svg?label=Maven%20Central)](https://search.maven.org/search?q=g:%22com.github.petruki%22%20AND%20a:%22switcher-client%22)

### Features
- Able to work offline using a snapshot file downloaded from your remote Switcher-API.
- Silent mode automatically enables a contingent sub-process in case of some network issue happens between your application and the API.
- Built-in stub/mock mechanism that make much easier to create automated tests.
- High secure connectivity. Switcher Context is responsible to manage all the complexity between your application and API.

* * *

### Usage

##### - Install  
- Maven
```xml
<dependency>
    <groupId>com.github.petruki</groupId>
    <artifactId>switcher-client</artifactId>
    <version>1.0.1</version>
</dependency>
```

</br>

##### - Context properties
The context map properties contains all information regarding connectivity and settings strategies. These constants can be accessed using *SwitcherContextParam*.

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
There are a few different ways to call the API using the java library. They were created to add more flexibility in case you want to clean up things a little bit.
</br>Here are some examples:

1. **No parameters**

  Invoking the API can be made obtaining the switcher object and calling *isItOn*. It can also be forced to call another key any time you want.
  ```java
  Switcher switcher = SwitcherFactory.getSwitcher("FEATURE01");
  switcher.isItOn();
  //or
  switcher.isItOn("FEATURE01");
  ```

2. **Strategy validation - preparing input**

  Loading information into the switcher can be made by using *prepareEntry*, in case you want to include input from a different place of your code. Otherwise, it is also possible to include everything in the same call.
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
  - Entry.NETWORK: IP/range validation


3. **Strategy validation - all-in-one execution**

  All-in-one method is fast and include everything you need to execute a complex call to the API. Stack inputs changing the last parameter to *true* in case you need to add more values to the strategy validator
  ```java
  switcher.isItOn("FEATURE01", new Entry(Entry.NETWORK, "10.0.0.3"), false);
  ```

</br>

##### - Offline settings
You can force the Switcher Module to work offline by specifying the folder, in case it wasn't made yet and set the second parameter to *true*.

```java
properties.put(SwitcherContextParam.SNAPSHOT_LOCATION, "/src/resources");
SwitcherFactory.buildContext(properties, true);
```

</br>

##### - Built-in mock feature
Testing a new code is easy, but we want also to make sure that the old still works.
</br>For this reason, you can easily mockup a switcher execution just adding one single line to your test case.

```java
Switcher switcher = SwitcherFactory.getSwitcher("FEATURE01");

switcher.assume("FEATURE01", false);
switcher.isItOn(); // Now, it's going to return 'false'

switcher.forget("FEATURE01");
switcher.isItOn(); // Now, it's going to return the result gotten from the API or the Snaopshot file
```

</br>

### Version Log
- 1.0.1: Security patch - Log4J has been updated
- 1.0.0: Working release