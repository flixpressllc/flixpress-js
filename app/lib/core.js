define([
], function () {
  var Flixpress = {};
  
  Flixpress.mode = 'development';

  Flixpress.serverLocation = function () {
    if (Flixpress.mode === 'development'){
      return 'https://s3.amazonaws.com/FlixSamples/development_files'; // No ending forward slash
    } else {
      return 'https://flixpress.com';
    }
  };

  // Adds the server location if the string starts with a forward slash
  Flixpress.addServerLocation = function (urlString) {
    return (urlString.charAt(0) === '/') ? Flixpress.serverLocation() + urlString : urlString;
  }

  return Flixpress;
} );
