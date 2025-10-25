#### Overview
* * *

Create conditions that would enable the use of a new feature. These rules are not necessarily part of the implementation, however, they might be fundamental to assure that new changes are working properly not on a small proportion but controllable scope.
</br>Running multiple versions of your project can bring safeness by providing a soft-launch carrying less impact to your production environment.

The advantages of using strategies are:
- Assure that it is working as intended/tested
- Get early feedbacks
- Prepare for a bigger change
- Easy to monitor

*Fast response to negative feedbacks without impacting the final release.*

<img src="https://raw.githubusercontent.com/switcherapi/switcherapi-assets/master/docs/SwitcherAPI_softlaunch.jpg" class="image-style" alt=""/>

</br></br>

#### Usage
* * *

For each switcher it is possible to add at least 4 different types of strategy.
</br>For each strategy you can choose one of the available operations.

1. **Value validation**

  This plain text validator can be used to compare one or more string data you want.
  </br>The available operations for this validator are: Exist, Not exist, Equal, Not equal.

2. **Time and Date validation**

  Both validators are useful to test specific or range of date/time.
  </br>The available operations for this validator are: between, Lower, Greater.

3. **Network validation**

  Add network conditions if you want to restrict by a unique IP address or a range of IPs using CIDR notation.
  </br>The available operations for this validator are: Exist, Not exist.

4. **Numeric validation**

  Create validations based on numeric values. Decimals and negative values are also acceptable.
  </br>All operations are available for this validation.

5. **Regex validation**

  Regular expressions can be used to determine a wider possibility for validating strategies.
  </br>The available operations for this validator are: Exist, Not exist, Equal, Not equal.
  </br>- Equal and Not equal implicitly use \b (delimiter) flag to match the exact input.

6. **Payload validation**

  Payload validations are useful to validate keys from a JSON input request.
  </br>The available operations for this validator are: Has one, Has all.

<img src="[$ASSETS_LOCATION]documentation/images/strategies/strategy_create[$DARK_SUFFIX].png" class="image-style shadow dark-invert" alt=""/>

</br></br>

#### Cloning strategies
* * *

Strategies are defined per environment, adding more flexibility for you to specify conditions that are not shared or common among environments.
</br>To simplify, it is possible to clone a created strategy instead of starting from scratch.

<img src="[$ASSETS_LOCATION]documentation/images/strategies/strategy_clone[$DARK_SUFFIX].png" class="image-style shadow dark-invert" alt=""/><p>

</br></br>

#### Monitoring
* * *

Keep control of what is being sent as input to strategies. Under Metrics - Data tab view, besides the result of each call executed you can see what it was sent for each strategy.

<img src="[$ASSETS_LOCATION]documentation/images/strategies/strategy_data_fail[$DARK_SUFFIX].png" class="image-style shadow dark-invert" alt=""/><p>

</br></br>

* * *

*Did you find an error? Please, open an issue*
<a href="https://github.com/switcherapi/switcher-management/issues/new?title=fix:+[strategies.md]+-+[INSERT+SHORT+DESCRIPTION]" target="_blank">
    <img src="[$ASSETS_LOCATION]github.svg" style="width: 30px;">
</a> 
