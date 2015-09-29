// to depend on a bower installed component:
// define(['components/componentName/file'])

define([
  "./core",
  "./contexts/editor-window",
  "./editor-menu",
  "components/jxon/index",
  "./editor"
  ],
function( Flixpress, context, menu, jxon ) {

  jxon.config({
    lowerCaseTags: false
  });

  var replaceDivId = 'Template_FlashContent_Div';
  var xmlContainerDiv = function () {return context().$('#RndTemplate_HF')[0];};

  function prepareDOM () {
    context().$('object').parent().prepend($('<div id="' + replaceDivId + '"></div>'));
    context().$('object').remove();
  }

  // This could probably get moved to another module and
  // required for this one.
  function safeQueryStringToJSON(string) {            
    pairs = string.slice().split('&');
    
    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = pair[1] || '';
    });

    return JSON.parse(JSON.stringify(result));
  }


  var getCurrentPreset = function () {
    return [xmlContainerDiv().value];
  };

  // gets many of the vars we will be using in SetupRndTemplateFlash
  var getVars = function () {
    var varString = context().$('object param[name="flashvars"]')[0].value;
    var varObject = safeQueryStringToJSON( varString );

    // Still need the .swf file. It is in <object data="file.swf?v2">
    // We need it without the v2 stuff
    var swfFile = context().$('object')[0].data.split('?')[0];

    varObject.swf = swfFile;
    return varObject;
  }

  var splicePhotos = function (XMLString) {
    var currentPreset = jxon.stringToJs(getCurrentPreset());
    var oldPhotosArray = currentPreset.OrderRequestOfESlidesRndTemplate.RenderedData.UnusedImageUrls.String ? currentPreset.OrderRequestOfESlidesRndTemplate.RenderedData.UnusedImageUrls.String : [];
    var newPreset = jxon.stringToJs(XMLString);
    var newPhotosArray = newPreset.OrderRequestOfESlidesRndTemplate.RenderedData.UnusedImageUrls.String ? newPreset.OrderRequestOfESlidesRndTemplate.RenderedData.UnusedImageUrls.String : [];
    console.log(oldPhotosArray, newPhotosArray);
    for (var i = 0; i < oldPhotosArray.length; i++) {
      console.log('index of '+oldPhotosArray[i], newPhotosArray.indexOf(oldPhotosArray[i]))
      if (newPhotosArray.indexOf(oldPhotosArray[i]) === -1){
        // Then the new array doesn't contain the old value. Add it.
        newPhotosArray.unshift(oldPhotosArray[i]);
      }
    };
    console.log(oldPhotosArray, newPhotosArray);
    console.log(newPreset);

    return jxon.jsToString(newPreset);
  }

  var loadPreset = function (XMLString) {
    var el = xmlContainerDiv();
    var flashvars = getVars();
    if (!el) {return false;}
    el.value = XMLString;
    prepareDOM();
    // This function is defined in /Templates/Scripts/SetupRndTemplateFlash.js
    context().SetupRndTemplateFlash(
      flashvars.swf,
      replaceDivId,
      flashvars.Username,
      flashvars.TemplateId,
      flashvars.MinutesRemainingInContract,
      flashvars.MinimumTemplateDuration,
      "Edit", // Must always be in Edit mode for presets
      flashvars.isU
    );
  };

  // Reloads the presets that were on the page when it
  // first loaded
  var reloadCurrent = function () {
    if (getVars().Mode === "Add") {
      // We cannot reload the previous state if it was in Add mode to begin.
      // Well, we can... but it's pointless.
      return false;
    } else {
      loadPreset(getCurrentPreset()[0]);
      return true;      
    }
  };

  // Used by Flixpress.editor-menu
  Flixpress.editor.getPresetFile = function(url){
    //get file
    var data;
    var presetXML = $.ajax(url,{dataType: 'text'});
    presetXML.done(function(data){
      data = splicePhotos(data);
      loadPreset(data);
    });
  };


  Flixpress.editor.presets = function () {

    //wait for object:
    var $promise = new $.Deferred();
    var count = 0;
    function tryObject () {
      if( context().$('object param[name="flashvars"]').length > 0 ) {
        $promise.resolve();
        return true;
      }
      if (++count < 100) { setTimeout(tryObject, 200); }
    }
    tryObject();

    $promise.done(function(){
      menu.registerNewMenu('presets', true, Flixpress.serverLocation + '/templates/presets/template' + getVars().TemplateId + '.js');
      if (Flixpress.dev) {
        console.log(Flixpress.serverLocation + '/templates/presets/template' + getVars().TemplateId + '.js');
      }
    });
  };

  Flixpress.editor.getCurrentPreset = function () {
    if (Flixpress.dev) {
      console.log(jxon);
      console.log(jxon);
      console.log(getCurrentPreset()[0]); //weird that it needs the [0]
    }
  }

});
