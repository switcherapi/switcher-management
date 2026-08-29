***

<div align="center">
<b>Switcher Client SDK</b><br>
A Go SDK for Switcher API
</div>

***

### About

The **Switcher Client SDK for Go** provides integration with [Switcher-API](https://github.com/switcherapi/switcher-api), enabling feature flag management in Go applications.

#### Key Features

- **Clean & Maintainable**: Simple package-level access with an instance-based core
- **Local Mode**: Offline execution using snapshot files from your Switcher-API domain
- **Silent Mode**: Hybrid configuration with automatic fallback for connectivity issues
- **Built-in Testing Helpers**: Test-oriented mocking support adapted for Go
- **Zero Latency**: Local snapshot execution for high-performance scenarios
- **Monitoring**: Execution logging, caching, and error notification hooks

### Quick Start

Get up and running in just a few lines of code:

```go
package main

import (
	"fmt"

	"github.com/switcherapi/switcher-client-go"
)

func main() {
	client.BuildContext(client.Context{
		Domain:      "My Domain",
		URL:         "https://api.switcherapi.com",
		APIKey:      "[YOUR_API_KEY]",
		Component:   "MyApp",
		Environment: "default",
	})

	switcher := client.GetSwitcher("FEATURE_TOGGLE")
	enabled, err := switcher.IsOn()
	if err != nil {
		panic(err)
	}

	if enabled {
		fmt.Println("Feature is enabled!")
	}
}
```

### Installation

Install the Switcher Client SDK:

```bash
go get github.com/switcherapi/switcher-client-go
```

#### System Requirements
- **Go**: 1.25+ (targeting 1.25.x and 1.26.x)
- **Operating System**: Cross-platform (Windows, macOS, Linux)

### Configuration

#### Basic Setup

Initialize the Switcher Client with your domain configuration:

```go
package main

import (
	"github.com/switcherapi/switcher-client-go"
)

func main() {
	client.BuildContext(client.Context{
		Domain:      "My Domain",                	// Your Switcher domain name
		URL:         "https://api.switcherapi.com", // Switcher-API endpoint (optional)
		APIKey:      "[YOUR_API_KEY]",           	// Your component's API key (optional)
		Component:   "MyApp",                    	// Your application name (optional)
		Environment: "default",                  	// Environment ("default" for production)
	})

	switcher := client.GetSwitcher("FEATURE_LOGIN_V2")
	_ = switcher
}
```

##### Configuration Parameters

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| `Domain` | ✅ | Your Switcher domain name | - |
| `URL` |  | Switcher-API endpoint | `https://api.switcherapi.com` |
| `APIKey` |  | API key for your component | - |
| `Component` |  | Your application identifier | - |
| `Environment` |  | Target environment | `default` |

#### Advanced Configuration

Enable additional features like local mode, silent mode, and transport options:

```go
package main

import (
	"time"

	"github.com/switcherapi/switcher-client-go"
)

func main() {
	client.BuildContext(client.Context{
		Domain:      "My Domain",
		URL:         "https://api.switcherapi.com",
		APIKey:      "[YOUR_API_KEY]",
		Component:   "MyApp",
		Environment: "default",
		Options: client.ContextOptions{
			Local:                      true,
			Logger:                     true,
			Freeze:                     true,
			SnapshotLocation:           "./snapshot/",
			SnapshotAutoUpdateInterval: 30 * time.Second,
			SilentMode:                 5 * time.Minute,
			RestrictRelay:              true,
			ThrottleMaxWorkers:         2,
			Remote: client.RemoteOptions{
				CertPath:       "./certs/client.pem",
				AutoRenewToken: true,
				ConnectTimeout: 300 * time.Millisecond,
				Timeout:        5 * time.Second,
			},
		},
	})

	switcher := client.GetSwitcher("FEATURE_LOGIN_V2")
	_ = switcher
}
```

##### Advanced Options Reference

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `Local` | `bool` | Use local snapshot files only (zero latency) | `false` |
| `Logger` | `bool` | Enable logging/caching of feature flag evaluations | `false` |
| `Freeze` | `bool` | Enable cache-immutability responses for consistent results | `false` |
| `SnapshotLocation` | `string` | Directory for snapshot files | `""` |
| `SnapshotAutoUpdateInterval` | `time.Duration` | Auto-update interval for snapshots | `0` |
| `SilentMode` | `time.Duration` | Silent mode retry time before returning to remote mode | `0` |
| `RestrictRelay` | `bool` | Enable relay restrictions in local mode | `true` |
| `ThrottleMaxWorkers` | `int` | Max workers for throttling refresh tasks | runtime-defined |
| `Remote` | `RemoteOptions` | Remote transport settings | `RemoteOptions{}` |

`RemoteOptions` fields:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `CertPath` | `string` | Path to a PEM bundle containing the client certificate and private key for secure API connections | `""` |
| `AutoRenewToken` | `bool` | Proactively renew the auth token in the background shortly before it expires, avoiding synchronous re-auth latency on foreground requests | `false` |
| `ConnectTimeout` | `time.Duration` | Max time to establish a remote connection before failing fast | `300ms` |
| `Timeout` | `time.Duration` | Max time for remote request/response and idle connection reuse | `5s` |

**Note:** lower remote connect timeouts help silent mode fall back faster when the upstream is unavailable.

### Usage Examples

#### Basic Feature Flag Checking

The simplest way to check if a feature is enabled:

```go
switcher := client.GetSwitcher("FEATURE_LOGIN_V2")

enabled, err := switcher.IsOn()
if err != nil {
	panic(err)
}

if enabled {
	newLogin()
} else {
	legacyLogin()
}
```

#### Detailed Response Information

Get comprehensive information about the feature flag evaluation:

```go
response, err := client.GetSwitcher("FEATURE_LOGIN_V2").IsOnWithDetails()
if err != nil {
	panic(err)
}

fmt.Printf("Feature enabled: %v\n", response.Result)
fmt.Printf("Reason: %s\n", response.Reason)
fmt.Printf("Metadata: %#v\n", response.Metadata)
```

#### Must-variant with default response

Simpified response handling with default values when errors occur:

```go
feature := client.GetSwitcher("FEATURE_LOGIN_V2")

enabled = feature.IsOnOrDefault(false)
response := feature.IsOnWithDetailsOrDefault(ResultDetail{
	Result: false,
	Reason: "default",
})
```

Use the async error channel for non-blocking error handling:

```go
client.SubscribeNotifyError(func(err error) {
	fmt.Printf("Switcher Error: %v\n", err)
})
```

#### Strategy-Based Feature Flags

##### Method 1: Prepare and Execute

Load validation data separately, useful for complex applications:

```go
prepared := client.GetSwitcher("").
	Check(client.StrategyValue, "USER_123")

if err := prepared.Prepare("USER_FEATURE"); err != nil {
	panic(err)
}

enabled, err := prepared.IsOn()
if err != nil {
	panic(err)
}

if enabled {
	enableUserFeature()
}
```

##### Method 2: All-in-One Execution

Chain multiple validation strategies for comprehensive feature control:

```go
isEnabled, err := client.GetSwitcher("PREMIUM_FEATURES").
	CheckValue("premium_user").
	CheckNumeric("42").
	CheckDate("2026-06-24").
	CheckTime("09:30").
	CheckPayload(`{"tier":"premium","account":{"region":"us"}}`).
	CheckNetwork("192.168.1.0/24").
	CheckRegex(`premium_[a-z]+`).
	Throttle(time.Second).
	IsOn()

if err != nil {
	panic(err)
}

if isEnabled {
	showPremiumDashboard()
}
```

Supported convenience helpers map to the same generic entry-point: `CheckValue`, `CheckNumeric`,
`CheckDate`, `CheckTime`, `CheckPayload`, `CheckNetwork`, and `CheckRegex`.

#### Error Handling

Subscribe to error notifications for robust error management:

```go
client.SubscribeNotifyError(func(err error) {
	fmt.Printf("Switcher Error: %v\n", err)
})
```

### Advanced Features

#### Throttling

Throttle implements Stale-While-Revalidate behavior for feature flag evaluations, returning cached results while refreshing in the background. This is ideal for high-traffic scenarios where you want to minimize latency and avoid overwhelming the API with requests.

```go
_, err := client.GetSwitcher("FEATURE01").Throttle(time.Second).IsOn()
if err != nil {
	panic(err)
}
```

Throttle reuses the latest cached execution for the same switcher key and inputs. It records that cached execution even when `ContextOptions.Logger` is `false`, and when `Freeze` is enabled the cached value stays in place until `client.ClearLogger()` is called.

```go
switcher := client.GetSwitcher("FEATURE01").Throttle(time.Second)
_, _ = switcher.IsOnWithDetails()

logged := client.GetExecution(switcher)
fmt.Println(logged.Response.Metadata["cached"])
```

#### Hybrid Mode

When `ContextOptions.Local` is enabled, evaluations are resolved against the local snapshot by default. Chain `.Remote()` on a specific Switcher to force that call to always use the remote API instead, without disabling Local Mode for the rest of the client.

```go
_, err := client.GetSwitcher("FEATURE01").Remote().IsOn()
if err != nil {
	panic(err)
}
```

`Remote()` requires `ContextOptions.Local` to be `true` — otherwise `Validate`/`IsOn`/`IsOnWithDetails` return an error. Pass `Remote(false)` to explicitly clear the override and fall back to the client's normal `Local`/Silent Mode behavior.

#### Circuit Breaker: Silent Mode

This feature allows you to specify how long the client SDK should attempt to restore connectivity in case of remote API failures.

When the API is unavailable, the SDK will automatically operate in silent mode, evaluating Switchers using a local snapshot. It is important to note that any Switcher Key configured must be able to resolve without external dependencies (e.g., Switcher Relay).

Make sure to configure the scheduled snapshot auto-update to keep the local snapshot up to date with the remote API.

Here is an example - in-memory snapshot with auto-update every 30 seconds:

```go
client.BuildContext(client.Context{
	Domain:      "My Domain",
	URL:         "https://api.switcherapi.com",
	APIKey:      "[YOUR_API_KEY]",
	Component:   "MyApp",
	Options: client.ContextOptions{
		SnapshotAutoUpdateInterval: 30 * time.Second,
		SilentMode:                 5 * time.Minute,
	},
})
```

### Snapshot Management

#### Loading Snapshots

Load snapshots from the API or local files:

```go
version, err := client.LoadSnapshot(nil)
if err != nil {
	panic(err)
}

fmt.Println(version)
```

```go
version, err := client.LoadSnapshot(&client.LoadSnapshotOptions{
	FetchRemote: true,
})
if err != nil {
	panic(err)
}

fmt.Println(version)
```

```go
_, err := client.LoadSnapshot(&client.LoadSnapshotOptions{
	WatchSnapshot: true,
})
if err != nil {
	panic(err)
}
```

#### Version Management

Check your current snapshot version:

```go
updated, err := client.CheckSnapshot()
if err != nil {
	panic(err)
}

fmt.Printf("Snapshot updated: %v\n", updated)
fmt.Printf("Current snapshot version: %d\n", client.SnapshotVersion())
```

#### Automated Updates

Schedule automatic snapshot updates for zero-latency local mode:

```go
client.ScheduleSnapshotAutoUpdate(time.Minute, func(err error, updated bool) {
	if err != nil {
		fmt.Printf("snapshot update error: %v\n", err)
		return
	}

	if updated {
		fmt.Printf("Snapshot updated to version: %d\n", client.SnapshotVersion())
	}
})
```

#### Snapshot Monitoring

```go
err := client.WatchSnapshot(client.WatchSnapshotCallback{
	Success: func() {
		fmt.Println("snapshot loaded successfully")
	},
	Reject: func(err error) {
		fmt.Printf("error loading snapshot: %v\n", err)
	},
})
if err != nil {
	panic(err)
}
```

### Testing & Development

#### Built-in Mocking

The Go SDK provides client-scoped test mocking adapted to Go idioms and safer state ownership.

```go
sdk := client.NewClient(ctx)
sdk.Assume("FEATURE01").True()

enabled, err := sdk.GetSwitcher("FEATURE01").IsOn()
assert.NoError(t, err)
assert.True(t, enabled)
```

```go
sdk.Assume("FEATURE01").True().Cleanup(t)
```

```go
sdk.Assume("FEATURE01").True().
	When(client.StrategyValue, []string{"guest", "admin"}).
	When(client.StrategyNetwork, "10.0.0.3")

enabled, err := sdk.GetSwitcher("FEATURE01").
	CheckValue("guest").
	CheckNetwork("10.0.0.3").
	IsOn()
assert.NoError(t, err)
assert.True(t, enabled)
```

```go
sdk.Forget("FEATURE01")
```

```go
sdk.Assume("FEATURE01").False().WithMetadata(map[string]any{
	"message": "Feature is disabled",
})

response, err := sdk.GetSwitcher("FEATURE01").IsOnWithDetails()
assert.NoError(t, err)
assert.Equal(t, false, response.Result)
assert.Equal(t, "Feature is disabled", response.Metadata["message"])
```

Mocks stay scoped to the `sdk` instance. Remove them explicitly with `sdk.Forget("FEATURE01")` or register automatic test cleanup with `.Cleanup(t)`.

#### Configuration Validation

Validate your feature flag configuration before deployment:

```go
err := client.CheckSwitchers([]string{
	"FEATURE_LOGIN",
	"FEATURE_DASHBOARD",
	"FEATURE_PAYMENTS",
})
if err != nil {
	fmt.Printf("Configuration error: %v\n", err)
}
```

This validation helps prevent deployment issues by ensuring all required feature flags are properly set up in your Switcher domain.

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[libgo.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]github.svg" style="width: 30px;">
</a>
