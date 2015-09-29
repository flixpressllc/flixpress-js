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


  var getCurrentConditions = function (returnType) {
    var currentConditions = jxon.stringToJs( xmlContainerDiv().value );
    var pipedImagesExists = context().$('#CroppedImageFilenames')[0].value !== '';
    
    // in "Add" mode, RenderedData won't be there yet, so we have to add it.
    if (currentConditions.OrderRequestOfESlidesRndTemplate.RenderedData === undefined) {
      currentConditions.OrderRequestOfESlidesRndTemplate.RenderedData = {};
      currentConditions.OrderRequestOfESlidesRndTemplate.RenderedData.UnusedImageUrls = {};
      currentConditions.OrderRequestOfESlidesRndTemplate.RenderedData.UnusedImageUrls.String = [];
    }

    // pipedImgages will exist whenever user images have first been uploaded to the template before saving a preview
    if (pipedImagesExists) {
      // Combine everything into on json object
      
      // Image file names are pipe delineated
      var pipedImagesArray = context().$('#CroppedImageFilenames').attr('value').split('|');

      // Finally add in the piped images.
      for (var i = pipedImagesArray.length - 1; i >= 0; i--) {
        if (pipedImagesArray[i] !== ''){
          currentConditions.OrderRequestOfESlidesRndTemplate.RenderedData.UnusedImageUrls.String.unshift(pipedImagesArray[i])
        }
      };

    }


    if (returnType === 'xml') {
      return jxon.jsToString( currentConditions );
    } else {
      return currentConditions;
    }
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

  /*
   * preset: (object) JXON.stringToJs version of an XML preset
   */
  var addCurrentPhotosToPreset = function (preset) {
    var currentConditions = getCurrentConditions();
    var currentPhotosArray = currentConditions.OrderRequestOfESlidesRndTemplate.RenderedData.UnusedImageUrls.String;
    var newPhotosArray = preset.OrderRequestOfESlidesRndTemplate.RenderedData.UnusedImageUrls.String;
    
    console.log(currentPhotosArray, newPhotosArray);
    
    for (var i = currentPhotosArray.length - 1; i >= 0; i--) {
      if (newPhotosArray.indexOf(currentPhotosArray[i]) === -1){
        // Then the new array doesn't contain the old value. Add it.
        newPhotosArray.unshift(currentPhotosArray[i]);
      }
    };
    
    console.log(currentPhotosArray, newPhotosArray);
    console.log(preset);

    return preset;
  }

  var loadPreset = function (xmlObject) {
    var el = xmlContainerDiv();
    var flashvars = getVars();
    if (!el) {return false;}
    el.value = jxon.jsToString(xmlObject);
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
      loadPreset(getCurrentConditions());
      return true;      
    }
  };

  // Used by Flixpress.editor-menu
  Flixpress.editor.getPresetFile = function(url){
    //get file
    var data;
    var presetXML = $.ajax(url,{dataType: 'text'});
    presetXML.done(function(data){
      data = jxon.stringToJs(data);
      data = addCurrentPhotosToPreset(data);
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
      menu.registerNewMenu('presets', true, Flixpress.serverLocation() + '/templates/presets/template' + getVars().TemplateId + '.js');
      if (Flixpress.dev) {
        console.log(getCurrentConditions('xml'));
      }
    });
  };

  Flixpress.editor.getPresetXML = function () { console.log(getCurrentConditions('xml')); return getCurrentConditions('xml'); }

});
