define([
  "./core",
  "./editor-menu"
], function( Flixpress, menu ) { Flixpress.helpMenu = function(){

  var cssFile = '/help/help-menu.css';
  var jsonFile = '/help/help-json.js';

  menu.registerNewMenu('help',jsonFile,cssFile);

  return;

};

});
