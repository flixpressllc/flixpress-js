define([
], function () {
  var Flixpress = {};
  
  Flixpress.dev = false;

  if (Flixpress.dev === true){
    Flixpress.serverLocation = 'https://s3.amazonaws.com/flixpress/dev_files'; // No ending forward slash
  } else {
    Flixpress.serverLocation = '';
  }

  return Flixpress;
} );
