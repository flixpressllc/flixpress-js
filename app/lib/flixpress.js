// to depend on a bower installed component:
// define(['bower_components/componentName/file'])

define([
  "./core",
  "./switch-modes",
  "./player",
  "./help-menu",
  "./template-data",
  "./presets",
  "./editor/addAudioButton"
  ],
function( Flixpress ) {
  Flixpress.loaded.resolve().then( function(){
    window.Flixpress = Flixpress;
    $('body').trigger({type:'flixpressJsLoaded'});
  });
  return;
});
