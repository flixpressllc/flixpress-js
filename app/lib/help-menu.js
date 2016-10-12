define([
  "./core",
  "./editor-menu",
  "./editor"
], function( Flixpress, menu ) { Flixpress.editor.helpMenu = function(){

  var cssFile = '/help/help-menu.css';
  var jsonFile = '/help/help-json.js';

  menu.registerNewMenu('help', false, jsonFile, 'topLeft');

  return;

};

});
