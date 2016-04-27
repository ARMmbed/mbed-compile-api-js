# mbed-compile-api-js
JavaScript library to access the mbed compiler API

## Requirements
- a [developer.mbed.org](http://developer.mbed.org/login) acount
- the URL for a mbed program you wish to compile

## What does it do?
The mbed configurator allows you to build existing mbed projects. You can either build an existing mbed project or tweak it by passing in configuration parameters that will override existing `#define`'s.

## How to use
- Create a webpage that included the `mbed.configurator.js` file.
- Initialize a configurator object
```javascript
    var configurator = new mbedConfigurator(callbackFn);
```
- Set your credentials using the `configurator.setCredentials('username','password')` function. Fill in your mbed account credentials.
- Trigger a build `configurator.build('params','projectURL','boardName')`
    * `params` - this is a dictionary where the Keys match existing `#define` in the code. The value of the `#define` will be replaced with the value of the parameter.
    * `projectURL` - the fully qualified url to where the code lives.
    * `boardName` - the unique identifier for the target platform. This can be pulled form the URL for the [platforms](http://developer.mbed.org/platforms).

#### Example 1
compile public code at `developer.mbed.org/users/mbed_demo/code/remote-compile-demo`. The code has a `#define` that looks like the following.

```cpp
#define KEY "value"
```

We want to compile this code for the platform on this page [https://developer.mbed.org/platforms/mbed-LPC1768/](https://developer.mbed.org/platforms/mbed-LPC1768/).

The three variables are as follows

- `boardName` is `mbed-LPC1768`, as taken from the URL for the platform
- `projectURL` is `developer.mbed.org/users/mbed_demo/code/remote-compile-demo`
- `params` is {'KEY':'an arbitrary value'}. Now the `#define KEY` in the code will have the value `'an arbitrary value'`

## More Info
- [https://developer.mbed.org/handbook/Compile-API](https://developer.mbed.org/handbook/Compile-API) - info on compile API
- [https://developer.mbed.org/teams/mbed/code/mbed-API-helper](https://developer.mbed.org/teams/mbed/code/mbed-API-helper) - python script to build repositories

## Liscense
Apache-2.0
