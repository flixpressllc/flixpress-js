// to depend on a bower installed component:
// define(['components/componentName/file'])

// At one time was using JXON fork at happycollision/jxon
define([
  // "components/jxon/index",
  ],
function() {

  var replaceDivId = 'Template_FlashContent_Div';
  var xmlContainerDiv = $('#RndTemplate_HF')[0];

  function prepareDOM () {
    $('object').parent().prepend($('<div id="' + replaceDivId + '"></div>'));
    $('object').remove();
  }

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
    return [xmlContainerDiv.value];
  };

  // gets many of the vars we will be using in SetupRndTemplateFlash
  var getVars = function () {
    var varString = $('object param[name="flashvars"]')[0].value;
    var varObject = safeQueryStringToJSON( varString );

    // Still need the .swf file. It is in <object data="file.swf?v2">
    // We need it without the v2 stuff
    var swfFile = $('object')[0].data.split('?')[0];

    varObject.swf = swfFile;
    return varObject;
  }

  var loadPreset = function (XMLString) {
    var el = xmlContainerDiv;
    var flashvars = getVars();
    if (!el) {return false;}
    el.value = XMLString;
    prepareDOM();
    SetupRndTemplateFlash(
      flashvars.swf,
      replaceDivId,
      flashvars.Username,
      flashvars.TemplateId,
      flashvars.MinutesRemainingInContract,
      flashvars.MinimumTemplateDuration,
      flashvars.Mode,
      flashvars.isU
    );
  };

  var reloadCurrent = function () {
    loadPreset(getPresets()[0]);
  }

  return {
    presets: {
      loadPreset: loadPreset,
      getPresets: getPresets,
      reloadCurrent: reloadCurrent
    }
  };

});
