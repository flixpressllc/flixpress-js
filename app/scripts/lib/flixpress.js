// to depend on a bower installed component:
// define(['bower_components/componentName/file'])

define([
  "./help-menu",
  "./presets"
  ],
function(Flixpress) {
  return (window.Flixpress = Flixpress);
});
