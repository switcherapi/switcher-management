***

<div align="center">
<b>Switcher Client SDK</b><br>
A Python SDK for Switcher API
</div>

***

### About

The **Switcher Client SDK for Python** provides seamless integration with [Switcher-API](https://github.com/switcherapi/switcher-api), enabling powerful feature flag management in your Python applications.

#### Key Features

- **Clean & Maintainable**: Flexible and robust functions that keep your code organized
- **Local Mode**: Work offline using snapshot files from your Switcher-API Domain
- **Silent Mode**: Hybrid configuration with automatic fallback for connectivity issues
- **Built-in Mocking**: Manual and decorator-based test mocking with scoped mock isolation for concurrent execution
- **Zero Latency**: Local snapshot execution for high-performance scenarios
- **Secure**: Built-in protection against ReDoS attacks with regex safety features
- **Monitoring**: Comprehensive logging and error handling capabilities

### Quick Start

Get up and running in just a few lines of code:

```python
from switcher_client import Client

# Initialize the client
Client.build_context(
    domain='My Domain',
    url='https://api.switcherapi.com',
    api_key='[YOUR_API_KEY]',
    component='MyApp',
    environment='default'
)

# Use feature flags
switcher = Client.get_switcher()
if switcher.is_on('FEATURE_TOGGLE'):
    print("Feature is enabled!")
```

### Installation

Install the Switcher Client SDK:

```bash
# Pip
pip install switcher-client
```

```bash
# Conda
conda install switcherapi::switcher-client
```

#### System Requirements
- **Python**: 3.9+ (supports 3.9, 3.10, 3.11, 3.12, 3.13, 3.14)
- **Operating System**: Cross-platform (Windows, macOS, Linux)

### Configuration

#### Basic Setup

Initialize the Switcher Client with your domain configuration:

```python
from switcher_client import Client

Client.build_context(
    domain='My Domain',                 # Your Switcher domain name
    url='https://api.switcherapi.com',  # Switcher-API endpoint (optional)
    api_key='[YOUR_API_KEY]',           # Your component's API key (optional)
    component='MyApp',                  # Your application name (optional)
    environment='default'               # Environment ('default' for production)
)

switcher = Client.get_switcher()
```

##### Configuration Parameters

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| `domain` | ✅ | Your Switcher domain name | - |
| `url` |  | Switcher-API endpoint | `https://api.switcherapi.com` |
| `api_key` |  | API key for your component | - |
| `component` |  | Your application identifier | - |
| `environment` |  | Target environment | `default` |

#### Advanced Configuration

Enable additional features like local mode, silent mode, and security options:

```python
from switcher_client import Client, ContextOptions, RemoteOptions

Client.build_context(
    domain='My Domain',
    url='https://api.switcherapi.com',
    api_key='[YOUR_API_KEY]',
    component='MyApp',
    environment='default',
    options=ContextOptions(
        local=True,
        logger=True,
        freeze=True,
        snapshot_location='./snapshot/',
        snapshot_auto_update_interval=3,
        silent_mode='5m',
        restrict_relay=True,
        throttle_max_workers=2,
        regex_max_black_list=10,
        regex_max_time_limit=100,
        remote=RemoteOptions(
            cert_path='./certs/ca.pem',
            auto_renew_token=True,
            connect_timeout=0.3,
            read_timeout=5.0,
            write_timeout=5.0,
            pool_timeout=5.0,
            max_keepalive_connections=20,
            max_connections=100,
            keepalive_expiry=30.0
        )
    )
)

switcher = Client.get_switcher()
```

##### Advanced Options Reference

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `local` | `bool` | Use local snapshot files only (zero latency) | `False` |
| `logger` | `bool` | Enable logging/caching of feature flag evaluations | `False` |
| `freeze` | `bool` | Enable cache-immutability responses for consistent results | `False` |
| `snapshot_location` | `str` | Directory for snapshot files | `'./snapshot/'` |
| `snapshot_auto_update_interval` | `int` | Auto-update interval in seconds (0 = disabled) | `0` |
| `silent_mode` | `str` | Silent mode retry time (e.g., '5m' for 5 minutes) | `None` |
| `restrict_relay` | `bool` | Enable relay restrictions in local mode | `True` |
| `throttle_max_workers` | `int` | Max workers for throttling feature checks | `None` |
| `regex_max_black_list` | `int` | Max cached entries for failed regex | `100` |
| `regex_max_time_limit` | `int` | Regex execution time limit (ms) | `3000` |
| `remote` | `RemoteOptions` | Remote transport settings for certificate path, connect/read/write/pool timeouts | `RemoteOptions()` |

`RemoteOptions` fields:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `cert_path` | `str` | Path to custom certificate for secure API connections | `None` |
| `auto_renew_token` | `bool` | Automatically renew the auth token in the background before it expires | `False` |
| `connect_timeout` | `float` | Max seconds to establish a remote connection before failing fast | `0.3` |
| `read_timeout` | `float` | Max seconds to wait for remote response data | `5.0` |
| `write_timeout` | `float` | Max seconds to send remote request data | `5.0` |
| `pool_timeout` | `float` | Max seconds to wait for a pooled HTTP connection | `5.0` |
| `max_keepalive_connections` | `int` | Max number of idle keep-alive connections to maintain | `20` |
| `max_connections` | `int` | Max number of concurrent connections allowed | `100` |
| `keepalive_expiry` | `float` | Max seconds a keep-alive connection can remain idle | `30.0` |

`response.status_code` is only available when the upstream returns an HTTP response such as `503`.
When the upstream is unavailable, the client raises a transport error instead and silent mode now
uses the configured remote timeouts to fail fast and switch back to local evaluation.

#### Security Features

- **ReDoS Protection**: Built-in ReDoS attack prevention with regex safety features
- **Time Limits**: Configurable timeouts prevent long-running regex operations
- **Certificate Support**: Use custom certificates for secure API connections

### Usage Examples

#### Basic Feature Flag Checking

The simplest way to check if a feature is enabled:

```python
switcher = Client.get_switcher()

# Simple boolean check
if switcher.is_on('FEATURE_LOGIN_V2'):
    # Use new login system
    new_login()
else:
    # Use legacy login
    legacy_login()
```

#### Detailed Response Information

Get comprehensive information about the feature flag evaluation:

```python
response = switcher.is_on_with_details('FEATURE_LOGIN_V2')

print(f"Feature enabled: {response.result}")     # True or False
print(f"Reason: {response.reason}")              # Evaluation reason
print(f"Metadata: {response.metadata}")          # Additional context
```

#### Strategy-Based Feature Flags

##### Method 1: Prepare and Execute

Load validation data separately, useful for complex applications:

```python
# Prepare the validation context
switcher.check_value('USER_123').prepare('USER_FEATURE')

# Execute when ready
if switcher.is_on():
    enable_user_feature()
```

##### Method 2: All-in-One Execution

Chain multiple validation strategies for comprehensive feature control:

```python
is_enabled = switcher \
                    # VALUE strategy
                    .check_value('premium_user') \
                    # NETWORK strategy
                    .check_network('192.168.1.0/24') \
                    # Fallback value if API fails
                    .default_result(True) \
                    # Cache result for 1 second
                    .throttle(1000) \
                    .is_on('PREMIUM_FEATURES')

if is_enabled:
    show_premium_dashboard()
```

#### Error Handling

Subscribe to error notifications for robust error management:

```python
# Set up error handling
Client.subscribe_notify_error(lambda error: print(f"Switcher Error: {error}"))
```

### Advanced Features

#### Throttling

```python
# Zero-latency async execution
switcher.throttle(1000).is_on('FEATURE01')
```

#### Hybrid Mode

```python
# Force remote resolution for specific features
switcher.remote().is_on('FEATURE01')
```

#### Circuit Breaker: Silent Mode

This feature allows you to specify how long the client SDK should attempt to restore connectivity in case of remote API failures.

When the API is unavailable, the SDK will automatically operate in silent mode, evaluating Switchers using a local snapshot. It is important to note that any Switcher Key configured must be able to resolve without external dependencies (e.g., Switcher Relay).

Make sure to configure the scheduled snapshot auto-update to keep the local snapshot up to date with the remote API.

Here is an example - in-memory snapshot with auto-update every 30 seconds:

```python
Client.build_context(
    domain='My Domain',
    url='https://api.switcherapi.com',
    api_key='[YOUR_API_KEY]',
    component='MyApp',
    options=ContextOptions(
        snapshot_auto_update_interval=30,
        silent_mode='5m',
    )
)
```

### Snapshot Management

#### Loading Snapshots

Load snapshots from the API or local files:

```python
# Load snapshot from local file
Client.load_snapshot()
```

```python
# Load snapshot from API with fetch_remote option
Client.load_snapshot(LoadSnapshotOptions(fetch_remote=True))
```

```python
# Load snapshot with watch option to update the client in real-time when file changes
Client.load_snapshot(LoadSnapshotOptions(watch_snapshot=True))
```

#### Version Management

Check your current snapshot version:

```python
# Verify snapshot version
version_info = Client.check_snapshot()
print(f"Current snapshot version: {Client.snapshot_version()}")
```

#### Automated Updates

Schedule automatic snapshot updates for zero-latency local mode:

```python
Client.schedule_snapshot_auto_update(
    interval=60,
    callback=lambda error, updated: (
        print(f"Snapshot updated to version: {Client.snapshot_version()}") if updated else None
    )
)
```

#### Snapshot Monitoring

```python
# Watch for snapshot file changes
Client.watch_snapshot(WatchSnapshotCallback(
    success=lambda: print("✅ Snapshot loaded successfully"),
    reject=lambda e: print(f"❌ Error loading snapshot: {e}")
))
```

### Testing & Development

#### Built-in Mocking

The SDK includes powerful mocking capabilities for testing. Forced values are scoped to the current execution context, which adds a safe-net for concurrent test runs in the same process by reducing mock leakage between overlapping test executions while keeping the mocking API unchanged.

```python
# Mock feature states for testing
Client.assume('FEATURE01').true()
assert switcher.is_on('FEATURE01') == True
```

```python
# Conditional mocking based on input criteria
Client.assume('FEATURE01').true() \
    # value can be either 'guest' or 'admin'
    .when(StrategiesType.VALUE.value, ['guest', 'admin']) \
    .when(StrategiesType.NETWORK.value, '10.0.0.3')

assert switcher \
    .check_value('guest') \
    .check_network('10.0.0.3') \
    .is_on('FEATURE01') == True
```

```python
# Reset to normal behavior
Client.forget('FEATURE01')
```

```python
# Mock with metadata
Client.assume('FEATURE01').false().with_metadata({
    'message': 'Feature is disabled'
})
response = switcher.is_on_with_details('FEATURE01')
assert response.result == False
assert response.metadata['message'] == 'Feature is disabled'
```

#### Decorator-Based Testing

Decorator-based tests can use the same fluent mocking rules while automatically cleaning up mocked flags after the test finishes:

```python
@switcher_test(assume_test('FEATURE01').true())
def test_feature_flag():
    assert switcher.is_on('FEATURE01') == True
```

```python
@switcher_test(
    assume_test('FEATURE01').true()
        .when(StrategiesType.VALUE.value, 'guest')
        .with_metadata({'message': 'Decorated mock'})
)
def test_feature_flag_with_rules():
    response = switcher.check_value('guest').is_on_with_details('FEATURE01')
    assert response.result == True
    assert response.metadata['message'] == 'Decorated mock'
```

```python
@switcher_test(
    assume_test('FEATURE01').true(),
    assume_test('FEATURE02').false()
)
def test_multiple_flags():
    assert switcher.is_on('FEATURE01') == True
    assert switcher.is_on('FEATURE02') == False
```

Decorator behavior:

- `assume_test('FEATURE')` builds a single mocked flag assumption
- `switcher_test(...)` accepts one or more assumptions
- fluent mock rules are preserved, including `.true()`, `.false()`, `.when(...)`, and `.with_metadata(...)`
- mocked flags are always cleaned up with `Client.forget(...)` after the test finishes, even when the test raises an error
- both regular `def` tests and `async def` tests are supported

This decorator API is intended as a test convenience and mock-isolation improvement. It improves the safety of mocked flags in concurrent execution within the same process, but should not be treated as full SDK-wide parallel execution support.

#### Test Mode Configuration

Convenient functionality to prevent subprocess locking of snapshot files during testing.

```python
# Enable test mode to prevent snapshot file locking when running tests
Client.test_mode()
```

#### Configuration Validation

Validate your feature flag configuration before deployment:

```python
# Verify that all required switchers are configured
try:
    Client.check_switchers(['FEATURE_LOGIN', 'FEATURE_DASHBOARD', 'FEATURE_PAYMENTS'])
    print("✅ All switchers are properly configured")
except Exception as e:
    print(f"❌ Configuration error: {e}")
```

This validation helps prevent deployment issues by ensuring all required feature flags are properly set up in your Switcher domain.

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[libpython.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]github.svg" style="width: 30px;">
</a>
