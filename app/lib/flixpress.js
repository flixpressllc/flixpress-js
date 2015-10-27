// to depend on a bower installed component:
// define(['bower_components/componentName/file'])

define([
  "./core",
  "./player",
  "./help-menu",
  "./presets"
  ],
function( Flixpress ) {
  window.Flixpress = Flixpress;
  $('body').trigger({type:'flixpressJsLoaded'});
  return;
});
