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
- Trigger a build. There are two types of builds, `buildProgram` for building programs by name in your mbed workspace, or `buildRepo` for building programs on the developer.mbed.org website via a absolute URL. Each of these takes three arguments.
    * `symbols` - this is a dictionary where the Keys match existing `#define` in the code. The value of the `#define` will be replaced with the value of the parameter.
    * `program/repo` - For `buildProgram` this is the name of the project in your workspace. For `buildRepo` this is the absolute URL of the repo.
    * `boardName` - the unique identifier for the target platform. This can be pulled form the URL for the [platforms](http://developer.mbed.org/platforms).

#### Example 1
compile public code at [`developer.mbed.org/teams/mbed_example/code/Compile_API/`](https://developer.mbed.org/teams/mbed_example/code/Compile_API/). The code has a `#define` that looks like the following.

```cpp
#ifndef MESSAGE
#define MESSAGE "Default Message\r\n"   // Change this message
#endif
#ifndef LED
#define LED LED1                        // Try changing to LED1-4
#endif
```
Thus the example web page will pass in a `MESSAGE` and a `LED` variable.

We want to compile this code for the platform on this page [https://developer.mbed.org/platforms/mbed-LPC1768/](https://developer.mbed.org/platforms/mbed-LPC1768/).

To compile this project we will need to pass in three parameters to the javascript library. 

- `boardName` is `mbed-LPC1768`, as taken from the URL for the platform
- `repo` is `https://developer.mbed.org/teams/mbed_example/code/Compile_API/`
- `params` is {'KEY':'an arbitrary value'}. Now the `#define MESSAGE` in the code will have the value `'an arbitrary value'`

## More Info
- [https://developer.mbed.org/handbook/Compile-API](https://developer.mbed.org/handbook/Compile-API) - info on compile API
- [https://developer.mbed.org/teams/mbed/code/mbed-API-helper](https://developer.mbed.org/teams/mbed/code/mbed-API-helper) - python script to build repositories

## Liscense
Apache-2.0
