// to depend on a bower installed component:
// define(['components/componentName/file'])

// At one time was using JXON fork at happycollision/jxon
define([
  // "components/jxon/index",
  ],
function() {

  var context = function(){return $('#cboxWrapper iframe')[0].contentWindow;};

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


  var getPresets = function () {
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

  var loadPreset = function (XMLString) {
    var el = xmlContainerDiv();
    var flashvars = getVars();
    if (!el) {return false;}
    el.value = XMLString;
    prepareDOM();
    // This function is defined in flixpress.com/Templates/Scripts/SetupRndTemplateFlash.js
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
    loadPreset(getPresets()[0]);
  }

  // This actully wires up Flixpress.presets.etcetera
  // There might be a better way to do this, but I
  // am not familiar with it yet.
  return {
    presets: {
      loadPreset: loadPreset,
      getPresets: getPresets,
      reloadCurrent: reloadCurrent,
      container: xmlContainerDiv
    }
  };

});
