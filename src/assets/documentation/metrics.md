<style>
  .image-style {
    width: 100%;
    max-width: max-content;
    box-shadow: 0px 0px 10px black;
  }
</style>

#### Overview
Monitoring is a great feature for you to keep track of every call from your registered applications. With Metrics, you can find what, when, and how features are being used.

When your application/component calls the API, it will store the result of this execution afterwards. It means that if the switcher is turned off, the reason that will be recorded is 'Config disabled'. In case you have configured a specific strategy that allows the use of that feature for a specific range of IPs, for instance, it will record whether input matched or not.

<img src="assets/documentation/images/metrics/metric_bar.jpg" class="image-style" alt=""/><p>

<hr>

##### Overall Statistics
When visualizing Overall Statistics, it is possible to find insights into the following:
 - **Switchers View**
    
    Quantifies how many negative and positive calls were made by switchers.

    <img src="assets/documentation/images/metrics/metric_switchers.jpg" class="image-style" style="box-shadow: none;" alt=""/><p>

    Get a more detailed view by clicking on one specific switcher bar. 
    </br>It will automatically open the filter mode to select the time frame, group by option and environment.

    <img src="assets/documentation/images/metrics/metric_filter.jpg" class="image-style" alt=""/><p>

- **Switchers Date/Time View**

    Navigate through the time frame to visualize the execution history. By clicking on one of the nodes you can also open the detailed Data View for that specific date-time.

    <img src="assets/documentation/images/metrics/metric_switchers_datetime.jpg" class="image-style" style="box-shadow: none;" alt=""/><p>


 - **Components View**
 
    Quantified per component. Here you can track how your components are behaving.

    <img src="assets/documentation/images/metrics/metric_components.jpg" class="image-style" style="box-shadow: none;" alt=""/><p>

 - **Resons View**
    
    Quantitative overall view of which flow features are being executed.

    <img src="assets/documentation/images/metrics/metric_reasons.jpg" class="image-style" style="box-shadow: none;" alt=""/><p>

##### Data View
The Data View displays more detailed information about the API criteria execution.
</br>This view is perfect for troubleshooting and double-check what information is being used to call the API.

<img src="assets/documentation/images/metrics/metric_data.jpg" class="image-style" style="box-shadow: none;" alt=""/><p>