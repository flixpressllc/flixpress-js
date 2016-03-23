// to depend on a bower installed component:
// define(['bower_components/componentName/file'])

define([
  "./core",
  "./switch-modes",
  "./player",
  "./help-menu",
  "./presets"
  ],
function( Flixpress ) {
  Flixpress.loaded.resolve().then( function(){
    window.Flixpress = Flixpress;
    $('body').trigger({type:'flixpressJsLoaded'});
  });
  return;
});
