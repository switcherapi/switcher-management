<style>
  .image-style {
    width: 100%;
    max-width: max-content;
    box-shadow: 0px 0px 10px black;
  }
</style>

<img src="assets/documentation/images/setup/5steps.jpg" 
  class="image-style" style="opacity: 0.9;" alt=""/><p>

Find here a quickstart in how to set up your first switcher.
<br/>The 5 steps show the minimum configuration necessary to start using Switcher API on your projects.

<hr>

#### 1. Sign up
Connect to Switcher Management signing up using either email or a GitHub account.
<p><br/>

#### 2. Domain
This is going to be your workspace which will contain:
- All your projects
- Switchers to toggle features
- Metrics
- Environment and application settings
- Team management

After creating your domain, you'll be given an API Key that will be used for all the applications. For security purposes, this key cannot be reclaimed, so keep it in a secure place.

<img src="assets/documentation/images/setup/domain_create.jpg" class="image-style" alt=""/><p>
<br/>

#### 3. Component
Configure here all your projects/applications that will make use of switchers. This step is required for you to keep track of everything.
<br>After registering your component, it will be available for you to link with any switcher.

<img src="assets/documentation/images/setup/components.jpg" class="image-style" alt=""/><p>
<br/>

#### 4. Group
Let's now create a group for all your features. This place is great for you to define projects and releases.
<br>With groups you can easily manage and change multiple switchers at once.

Examples of usage:

- Critical rollback when multiple applications must be recovered to their previous state
- Organizing features as releases or even long-term toggles.
<p><br/>


#### 5. Switcher
Finally, define your switcher by giving a key value and a brief description.
<br/>Since it's a constant value, though you can change in after creating, we suggest using the following patterns:

- No spaces
- All caps

<img src="assets/documentation/images/setup/switchers.jpg" class="image-style" alt=""/>