define([
], function () {
  var Flixpress = {};
  
  Flixpress.loaded = $.Deferred();
  
  // The string below will be replaced during `gulp production`.
  // The comment marks before the string are essential for that.
  Flixpress.mode = /**/'development';

  Flixpress.serverLocation = function () {
    if (Flixpress.mode === 'development'){
      return 'https://s3.amazonaws.com/FlixSamples/development_files'; // No ending forward slash
    } else {
      return ''; //No ending forward slash
    }
  };

  // Adds the server location if the string starts with a forward slash
  Flixpress.addServerLocation = function (urlString) {
    return (urlString.charAt(0) === '/') ? Flixpress.serverLocation() + urlString : urlString;
  }

  return Flixpress;
} );
