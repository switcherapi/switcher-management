***

<div align="center">
<b>Switcher Client SDK</b><br>
A Java SDK for Switcher API
</div>

***

### Features
- Flexible and robust SDK that will keep your code clean and maintainable.
- Able to work local using a snapshot file pulled from your remote Switcher-API Domain.
- Silent mode is a hybrid configuration that automatically enables contingent sub-processes in case of any connectivity issue.
- Built-in test annotation for clear and easy implementation of automated testing.
- Easy to setup. Switcher Context is responsible to manage all the configuration complexity between your application and API.

* * *

### Usage

##### - Install
- Using the source code `mvn clean install`
- Adding as a dependency - Maven
```xml
<dependency>
  <groupId>com.github.switcherapi</groupId>
  <artifactId>switcher-client</artifactId>
  <version>${switcher-client.version}</version>
</dependency>
```

- Gradle

```
implementation 'com.github.switcherapi:switcher-client:[VERSION]'
```

###### Compatibility with Jakarta EE 9
Use SDK v1.x for applications not using Jakarta EE 9.<br>
Use SDK v2.x for Jakarta EE 9 based applications.

</br>

##### - Client Context Properties
Define a feature class that extends SwitcherContext. This implementation will centralize all features in a single place of your application and will have all the operations and features available to access the API either remotely or locally from the snapshot files.

The Client SDK configuration must be defined in a properties file that contains all parameters for your application to start communicating with the API.

1. Inside the resources' folder, create a file named: switcherapi.properties.

Configure the parameters according to the definition below.</br>
You can also use environment variables using the standard notation ${VALUE:DEFAULT_VALUE}

**Required**

```properties
# Path of the feature class that extends SwitcherContext
switcher.context

# Swither-API endpoint (default value uses Switcher API cloud endpoint)
switcher.url

# Switcher-API key generated for the application/component
switcher.apikey

# Application/component name
switcher.component

# Domain name
switcher.domain
```

**Optional**

```properties
# Environment name. Production environment is named as 'default'
switcher.environment

# true/false When local, it will only use a local snapshot
switcher.local

# Folder from where snapshots will be saved/read
switcher.snapshot.location

# true/false Automated lookup for snapshot when initializing the client
switcher.snapshot.auto

# true/false Skip snapshotValidation() that can be used for UT executions
switcher.snapshot.skipvalidation

# Enable the Snapshot Auto Update given an interval of time - e.g. 1s (s: seconds, m: minutes)
switcher.snapshot.updateinterval

# Enable contigency given the time for the client to retry - e.g. 5s (s: seconds - m: minutes - h: hours)
switcher.silent

# Path to the truststore file
switcher.truststore.path -> Path to the truststore file

# Truststore password
switcher.truststore.password -> Truststore password

# Time in ms given to the API to respond - 3000 default value
switcher.timeout -> Time in ms given to the API to respond - 3000 default value

(Java 8 applications only)
switcher.regextimeout -> Time in ms given to Timed Match Worker used for local Regex (ReDoS safety mechanism) - 3000 default value
```

The Base Context provides with a more flexible way to configure the Client SDK.<br>
Instead of using SwitcherContext, which is used to automatically load from the switcherapi.properties, you can also use SwitcherContextBase and supply the ContextBuilder to include the settings.

```java
MyAppFeatures.configure(ContextBuilder.builder()
		.contextLocation("com.github.switcherapi.playground.Features")
		.apiKey("API_KEY")
		.url("https://api.switcherapi.com")
		.domain("Playground")
		.component("switcher-playground"));

MyAppFeatures.initializeClient();
```

Or simply define a custom file properties to load everything from it.

```java
// Load from resources/switcherapi-test.properties 
MyAppFeatures.loadProperties("switcherapi-test");
```

2. Defining your features

```java
public class MyAppFeatures extends SwitcherContext {
	
	@SwitcherKey
	public static final String MY_SWITCHER = "MY_SWITCHER";

}

Switcher mySwitcher = MyAppFeatures.getSwitcher(MY_SWITCHER);
mySwitcher.isItOn();
```

##### - Executing
There are a few different ways to call the API using the java library.
</br>Here are some examples:

1. **No parameters**

Invoking the API can be done by obtaining the switcher object and calling *isItOn*.

```java
Switcher switcher = MyAppFeatures.getSwitcher(FEATURE01);
switcher.isItOn();
```

Or, you can submit the switcher request and get the criteria response, which contains result, reason and metadata that can be used for any additional verification.

```java
CriteriaResponse response = switcher.submit();
response.isItOn(); // true/false
response.getReason(); // Descriptive response based on result value
response.getMetadata(YourMetadata.class); // Additional information
```

2. **Strategy validation - preparing input**

Loading information into the switcher can be made by using *prepareEntry*, in case you want to include input from a different place of your code. Otherwise, it is also possible to include everything in the same call.

```java
List<Entry> entries = new ArrayList<>();
entries.add(Entry.build(StrategyValidator.DATE, "2019-12-10"));
entries.add(Entry.build(StrategyValidator.DATE, "2020-12-10"));

switcher.prepareEntry(entries);
switcher.isItOn();
```

3. **Strategy validation - Fluent style**

Create chained calls to validate the switcher with a more readable and maintainable code.

```java
import static **.MyAppFeatures.*;

getSwitcher(FEATURE01)
	.checkValue("My value")
	.checkNetwork("10.0.0.1")
	.isItOn();
```

4. **Accessing the response history**

Switchers stores the last execution result from a given switcher key/entry.

```java
switcher.getHistoryExecution();
```

5. **Throttling**

Run Switchers asynchronously when using throttling. It will return the last known value until the throttle time is over.

```java
switcher.throttle(1000).isItOn();
```

</br>

##### - Local settings
You can also set the Switcher library to work locally. It will use a local snapshot file to retrieve the switchers configuration.

```java
MyAppFeatures.configure(ContextBuilder.builder()
	.local(true)
	.snapshotLocation("/src/resources"));

MyAppFeatures.initializeClient();

Switcher switcher = MyAppFeatures.getSwitcher(FEATURE01);
switcher.isItOn();
```
</br>

##### - Hybrid settings
Forcing Switchers to resolve remotely can help you define exclusive features that cannot be resolved locally.<br>
This feature is ideal if you want to run the SDK in local mode but still want to resolve a specific switcher remotely.

```java
switcher.forceRemote().isItOn();
```

Another option is to use in-memory loaded snapshots to resolve the switchers.<br>
Switcher SDK will schedule a background task to update snapshot in-memory a new version is available.

```java
MyAppFeatures.configure(ContextBuilder.builder()
    .url("https://api.switcherapi.com")
    .apiKey("[API-KEY]")
    .domain("Playground")
    .local(true)
    .snapshotAutoLoad(true)
    .snapshotAutoUpdateInterval("5s") // You can choose to configure here or using `scheduleSnapshotAutoUpdate`
    .component("switcher-playground"));

MyAppFeatures.initializeClient();
MyAppFeatures.scheduleSnapshotAutoUpdate("5s", new SnapshotCallback() {
    @Override
    public void onSnapshotUpdate(long version) {
        logger.info("Snapshot updated: {}", version);
    }

    @Override
    public void onSnapshotUpdateError(Exception e) {
        logger.error("Failed to update snapshot: {}", e.getMessage());
    }
});
```
</br>

##### - Real-time snapshot updater
Let the Switcher Client manage your application local snapshot.<br>
These features allow you to configure the SDK to automatically update the snapshot in the background.

1. This feature will update the in-memory Snapshot every time the file is modified.
```java
MyAppFeatures.watchSnapshot();
MyAppFeatures.stopWatchingSnapshot();
```

2. You can also perform snapshot update validation to verify if there are changes to be pulled.
```java
MyAppFeatures.validateSnapshot();
```

3. Enable the Client SDK to execute Snapshot Auto Updates in the background using configuration. It basically encapsulates the validateSnapshot feature into a scheduled task managed by the SDK.

```java
// It will check and update the local/in-memory snapshot to the latest version every second
MyAppFeatures.configure(ContextBuilder.builder()
	.snapshotAutoUpdateInterval("1s")
	.snapshotLocation("/src/resources"));
```

</br>

##### - Built-in test feature
Write automated tests using this built-in test annotation to guide your test scenario according to what you want to test.
</br>*SwitcherExecutor* implementation has 2 methods that can make mock tests easier. Use assume to force a value to a switcher and forget to reset its original state.

```java
Switcher switcher = MyAppFeatures.getSwitcher(FEATURE01);

SwitcherExecutor.assume(FEATURE01, false);
switcher.isItOn(); // 'false'

SwitcherExecutor.forget(FEATURE01);
switcher.isItOn(); // Now, it's going to return the result retrieved from the API or the Snapshot file
```

</br>

##### - Smoke test
Validate Switcher Keys on your testing pipelines before deploying a change.
Switcher Keys may not be configured correctly and can cause your code to have undesired results.

This feature will validate using the context provided to check if everything is up and running.
In case something is missing, this operation will throw an exception pointing out which Switcher Keys are not configured.

```java
@Test
void testSwitchers() {
	assertDoesNotThrow(() -> MyAppFeatures.checkSwitchers());
}
```

#### SwitcherTest annotation - Requires JUnit 5 Jupiter
Predefine Switchers result outside your test methods with the SwitcherTest annotation.
</br>It encapsulates the test and makes sure that the Switcher returns to its original state after concluding the test.

Simple use case (result is default to true, so it can be omitted):
```java
@SwitcherTest(key = MY_SWITCHER, result = true)
void testMyFeature() {
   assertTrue(instance.myFeature());
}
```

Multiple Switchers where more than one Switcher is used in the test:
```java
@SwitcherTest(switchers = {
    @SwitcherTestValue(key = MY_SWITCHER),
    @SwitcherTestValue(key = MY_SWITCHER2)
})
void testMyFeature() {
   assertTrue(instance.myFeature());
}
```

AB Test scenario where your test should return the same result regardless of the Switcher result:
```java
@SwitcherTest(key = MY_SWITCHER, abTest = true)
void testMyFeature() {
   assertTrue(instance.myFeature());
}
```

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[libjava.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]\github.svg" style="width: 30px;">
</a> 