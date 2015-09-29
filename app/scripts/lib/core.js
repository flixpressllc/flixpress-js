define([
], function () {
  var Flixpress = {};
  
  Flixpress.dev = true;

  if (Flixpress.dev === true){
    Flixpress.serverLocation = 'https://s3.amazonaws.com/FlixSamples/development_files'; // No ending forward slash
  } else {
    Flixpress.serverLocation = '';
  }

  return Flixpress;
} );
