define([
], function () {
  var Flixpress = {};
  
  Flixpress.loaded = $.Deferred();
  
  // The string below will be replaced during `gulp production`.
  // The comment marks before the string are essential for that.
  Flixpress.mode = 'production';
  /*d-> Flixpress.mode = 'development'; <-d*/

  Flixpress.serverLocation = function () {
    if (Flixpress.mode === 'development'){
      return 'https://s3.amazonaws.com/FlixSamples/development_files'; // No ending forward slash
    } else {
      return ''; //No ending forward slash
    }
  };

  // Adds the server location if the string starts with a forward slash
  // Returns the string untouched if it doesn't start with a slash, OR if
  // it starts with two slashes
  Flixpress.addServerLocation = function (urlString) {
    return ( urlString.charAt(0) === '/' && urlString.charAt(1) !== '/' ) ? Flixpress.serverLocation() + urlString : urlString;
  }
  
  // Adds the relative location of a file based on the root url given
  // if the url looks like it is relative. (doesn't start with 'http(s)://' or '/')
  Flixpress.addRelativeLocation = function (urlString, rootUrl) {
    // Looks relative?
    if (urlString.match(/^((https|http):)*\/\//i) === null) {
      // has final forward slash?
      if (rootUrl.charAt(rootUrl.length - 1) !== '/'){
        rootUrl = rootUrl + '/';
      }
      urlString = rootUrl + urlString;
    }
    return urlString;
  }

  // Attempts to prefix a url using the two methods above
  Flixpress.smartUrlPrefix = function (urlString, rootUrl) {
    var finalUrl = Flixpress.addServerLocation(urlString);
    if (finalUrl === urlString && rootUrl !== null) {
      finalUrl = Flixpress.addRelativeLocation(urlString, rootUrl);
    }
    return finalUrl;
  }

  return Flixpress;
} );
