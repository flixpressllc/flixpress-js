# Flixpress JS

Houses functionality for Flixpress.com's javascript components. Mostly functionally useless for anyone else, but maybe the structure of the code is helpful to you.

Requires jQuery. See [Building Flixpress JS](#building-flixpress-js) below for build requirements.

## API

### The `Flixpress` object

Once Flixpress JS has run, it will create an object called `Flixpress` in the `window` object. After it has successfully "installed" itself into that object, it will fire off an event called `flixpressJsLoaded` on the `body` element using jQuery's `trigger` method. Listen for that before you run any Flixpress JS methods. For example:

```javascript
$(document).ready(function () {
  // Your jQuery dependent code here
  
  $('body').on('flixpressJsLoaded', function () {
    // Your Flixpress JS dependent code here
  });
  
});
``` 


### `Flixpress.devMode<On/Off>`

Development mode will change the behavior of the Flixpress JS library. More information will be logged to the console, certain external file references will change, etc. In addition, features that are not quite production ready will be available in development mode.

To use the latest version of the in-development script, run `Flixpress.devModeOn()` in your console. This will reload the script from the currently defined development location.

To use the latest production version of the script, run `Flixpress.devModeOff()` in your console. This will reload the script from the currently defined production location.


### `Flixpress.editor`

A namespace for methods dealing with the modals that contain the editor interfaces on the site.


#### `Flixpress.editor.helpMenu()`

Invokes the help menu for the template editor. This method could be called at any time after the modal is opened, but it seems best to call it in the `CustomizeView`, since it currently only deals with things pertinent in that screen.

There will be a separate document describing how to create the json assets needed for help menu link creation.


#### `Flixpress.editor.presets()`

Invokes the presets menu for the current template editor. If no presets are available, the menu will not display. In [development mode][dm], it will also invoke the 'Get XML' button. When clicked, it will display the currently applied preset XML.

There will be a separate document describing how to create the json assets needed for preset creation.

[dm]: #-flixpress-devmode-on-off-


#### `Flixpress.editor.getPresetXML()`

Best used in [development mode][dm]. This method returns the currently applied preset XML.

There will be a separate document describing how to create the json assets needed for preset creation.


### `Flixpress.player`

A namespace for methods dealing with the video players on the site.

#### `Flixpress.player.setup()`

Creates a video player on the page. Currently acts as a bridge to JW Player.

##### .setup( videoURL, divId, [placeholderImage] )

* __videoUrl__: *string*  
A url to the video file.

* __divId__: *string*  
A string representing the ID of the div that is to be replaced with (or contain) the video player.

* __placeholderImage__: *string*  
A url to a placeholder image for the player. If no string is supplied, the player uses a default placeholder image.

##### .setup( videoURL, divId, [usePlaceholder] )

* __videoUrl__: *string*  
A url to the video file.

* __divId__: *string*  
A string representing the ID of the div that is to be replaced with (or contain) the video player.

* __usePlaceholder__: *boolean*  
Whether or not to use the default placeholder image. Defaults to true.

##### .setup( videoURL, divId, [options] )

* __videoUrl__: *string*  
A url to the video file.

* __divId__: *string*  
A string representing the ID of the div that is to be replaced with (or contain) the video player.

* __options__: *object*  
A set of key/value pairs that configure the player. All settings are optional.

  * width: *integer/string*  
  Default: `'100%'`  
  Desired width in pixels if the player given as an integer. For example, `width: 320` will set the player width to 320 pixels. Alternatively, the exact string value of `'100%'` may be used for responsive designs.

  * aspectRatio: *string*  
  Default: `'16:9'`  
  The desired aspect ratio of the video player described with a colon separating the width from height.
  
  * autoplay: *boolean*  
  Default: `false`  
  If `true`, will play the video as soon as it is ready.
  
  * repeat: *boolean*  
  Default: `false`  
  If `true`, will loop the video infinitely.
  
  * repeatTriggerFromEnd: *float*  
  Default: `0.3`  
  The number of seconds from the end of the video when the repeat function is triggered.
    
    *(The default repeat implementation of JW Player forces the user to re-download the file every time the video loops. The Flixpress JS version has circumvented that by jumping the playhead back to the beginning.)*

  * playerSkin: *string*  
  Default: `'/Video/features/flixsix.xml'`  
  URL to the xml file that houses the skin used for the JW Player.
  
  * placeholderImage: *string/boolean*  
  Default: `true`  
  A string that points to a placeholder image for the player. If a boolean is given, whether or not to use the default placeholder image (currently at `/images/video-placeholder.png`).
  
  * deepOptions: *object*  
  Default: `null`  
  An object that is passed directly to JW Player. Use this object to access JW Player's options directly. This is considered unstable and any code using this option might break if/when we move away from JW Player.
  
  * replaceDiv: *boolean*  
  Default: `false`  
  Whether or not to replace the div with the player. If `true`, the `divId` passed into the `.setup` function will be replaced with the elements that are created by JW Player. If `false`, the player elements will be placed *inside* the div.
  
  * noCache: *boolean*  
  Default: `false`  
  Force the browser to download a fresh copy of the video file on first play.
  
  * inViewPlay: *boolean*  
  Default: `false`  
  If `true`, automatically play/pause the video based on whether or not the video is currently in view.
  
  * overlay: *string/boolean*  
  Default: `false`  
  If a boolean, whether or not to show the default overlay ("Register now", etc). If a string, the HTML to be placed before the "Watch Again" button in the overlay. 
  

# Building Flixpress JS

> No need to understand the rest of this document unless you are helping to develop Flixpress.js

## Requirements

Flixpress JS assumes that jQuery and jQuery UI (specifically the `effect-slide` module) are present.

## Development

To use the build tools, be sure to include a file in the root directory (same as this file) that is named `aws.json` which contains your credentials for AWS. It should look like this:

```json
{
  "key": "SOMETHING",
  "secret": "SOMETHING+ELSE"
}
```

:exclamation::exclamation::exclamation: CAUTION: `.gitignore` is setup to ignore the `aws.json` file. If you rename it to something else, Git will pull it in by default with a commit and then syncing to GitHub will __publish your AWS credentials__. Please do not do that.

Beyond that, make sure that you've got [Node.js and NPM](https://nodejs.org/) installed, then clone this repo and run `npm install`.

## Understanding development mode when *building* Flixpress.js

Because some functions that are used in development mode require large additional includes, it is desirable to keep them OUT of the production code used on the website. Due to this need, there are two ways to compile the finished code in Gulp. Unfortunately, that means there is a "development mode" for both the actual *Flixpress.js library* and for *building* Flixpress.js using Gulp.

Building in "production mode" will compile the finished files and drop them onto the development server. Yes. I said that correctly. The development server is where the "production" version of the code goes. This is because that is where the code is staged before being copied onto the production server.

Building in "development mode" will compile the finished files and drop them into our AWS bucket. During the compilation process certain code will be replaced/UNcommented to enable development mode functions.

To build in development mode:

```bash
gulp development
```

To build in production mode:

```bash
gulp production
```

## Using development only comments

Building in development mode causes certain comments to be uncommented so that they run as javascript.

As of now, there is only one form of commenting: `/*d->`

Rather than explain just infer from the code below.

```javascript
Flixpress.mode = 'production';
/*d-> Flixpress.mode = 'development'; <-d*/
```

becomes

```javascript
Flixpress.mode = 'production';
Flixpress.mode = 'development';
```

