// to depend on a bower installed component:
// define(['components/componentName/file'])

define([
  "./core",
  "./contexts/editor-window",
  "./editor-menu",
  "components/jxon/index",
  /*d-> "components/js-beautify/js/index", <-d*/
  "./editor"
  ],
function( Flixpress, frameContext, menu, jxon /*d-> , jsb <-d*/ ) {

  var context = function(){
    try{
      return frameContext();
    } catch (e) {
      return window;
    }
  }

  var prettyXml = function (str) {
    if (Flixpress.mode === 'development') {
      return jsb.html(str);
    } else {
      return str;
    }
  }

  jxon.config({
    parseValues: true
  });

  // Monkey patch to fix for a change in JXON at 2.0.0
  // (the v2.0.0 branch adds an errant 'xmlns' property as 'undefined')
  // jxon.jsToString2 = jxon.jsToString;
  // jxon.jsToString = function (jsObj) {
  //   return jxon.jsToString2(jsObj).replace('xmlns="undefined" ','');
  // }

  var exampleWorkingOrderTemplate83 = {
    OrderRequestOfTextOnlyRndTemplate: {
      "$xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      "$xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      ResolutionOptions: {
        ListItemViewModel: [
          {
            Name: "720p",
            Id: 5
          },{
            Name: "1080p",
            Id: 3
          },{
            Name: "4K",
            Id: 4
          }
        ]
      },
      ResolutionId: "5",
      RenderedData: {
        Specs: {
          $name: "Specs",
          $val: "",
          SpCx: {
            CSp: {
              $name: "Properties",
              $val: "CD|Properties|",
              SpCx: {
                Sp: [
                  {
                    $name: "Top Line",
                    $val: "Is Working?"
                  },{
                    $name: "Bottom Line",
                    $val: ""
                  }
                ]
              }
            }
          }
        },
        AudioInfo: {
          Name: "",
          Length: "0",
          AudioType: "NoAudio",
          Id: "0",
          AudioUrl: "",
        }
      },
      IsPreview: false
    }
  };

  var startingPointTextOnly = {
    OrderRequestOfTextOnlyRndTemplate: {
      "$xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "$xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      ResolutionId: 0,
      RenderedData: {
        Specs: {
          $name: "Specs",
          $val: "",
          SpCx: {
            CSp: {
              $name: "Properties",
              $val: "CD|Properties|",
              SpCx: {
                Sp: [
                  // This is what we need to dynamically add:
                  // {
                  //   $name: "Top Line",
                  //   $val: "Is Working?"
                  // },{
                  //   $name: "Bottom Line",
                  //   $val: ""
                  // }
                ]
              }
            }
          }
        },
        AudioInfo: {
          Name: null,
          Length: "0",
          AudioType: "NoAudio",
          Id: "0",
          AudioUrl: null,
        }
      },
      IsPreview: false
    }
  };

  var xmlContainerDiv = function () {return context().$('#RndTemplate_HF')[0];};

  var getLoadedXmlAsString = function () {
    return prettyXml(xmlContainerDiv().value);
  };

  var getLoadedXmlAsObject = function () {
    return jxon.stringToJs(getLoadedXmlAsString(xmlContainerDiv().value));
  };

  var getEditorTemplateSettings = function () {
    return context().editorTemplateSettings;
  };

  var getTemplateId = function () {
    return getEditorTemplateSettings().templateId;
  };
  
  var getTopLevelXmlName = function () {
    return 'OrderRequestOfTextOnlyRndTemplate';
  };
  
  function changePropsInitialCase (obj, whichCase) {
    var makeAspVersion = (whichCase === 'UpperFirst') ? true : false ;
    var newObject = obj;
    if (makeAspVersion) {
      var regex = /[a-z]/;
    } else {
      var regex = /[A-z]/;
    }
    for (var key in newObject) {
      if (newObject.hasOwnProperty(key) === false) continue;
      if (typeof key !== 'string') continue;
      if (key.charAt(0).match(regex) === null) continue;

      var prop = newObject[key];
      var newName = '';
      if (makeAspVersion){
        newName = key.charAt(0).toUpperCase() + key.slice(1);
      } else {
        newName = key.charAt(0).toLowerCase() + key.slice(1);
      }
      delete newObject[key];
      newObject[newName] = prop;
    }
    return newObject;
  }

  var convertSpecsToReactData = function (xmlObj) {
    var result = {};
    if (xmlObj.RenderedData === undefined) {
      return result;
    } else {
      xmlObj = xmlObj.RenderedData;
    }
    
    // Audio Info
    if (xmlObj.AudioInfo !== undefined) {
      result.audioInfo = changePropsInitialCase(xmlObj.AudioInfo, 'lowerFirst');
    }
    
    if (xmlObj.Specs !== undefined) {
      
      try {
        // Text fields
        textFieldsArray = xmlObj.Specs.SpCx.CSp.SpCx.Sp;
        if (textFieldsArray.length > 0) {
          result.textFields = {};
        }
        var name = '';
        var value = '';
        for ( var i = 0; textFieldsArray.length > i; i++ ) {
          name = textFieldsArray[i].$name;
          value = textFieldsArray[i].$val;
          result.textFields[name] = value;
        }
      } catch (e) {}
    }
    
    return result;
  };

  var getReactStartingData = function () {
    var obj = getLoadedXmlAsObject();
    var topLvlName = getTopLevelXmlName();
    var result = convertSpecsToReactData(obj[topLvlName]);

    var givenResolutions = obj[topLvlName].ResolutionOptions.ListItemViewModel;
    // Eventual refactor for arrays of Objects?
    var resolutions = []
    for (var i=0; i < givenResolutions.length; i++) {
      resolutions.push(changePropsInitialCase(givenResolutions[i],'lowerFirst'));
    }
    result.resolutions = resolutions;
    result.resolutionId = resolutions[0].id;

    // The easy one:
    result.isPreview = obj[topLvlName].IsPreview;

    return result;
  };

  var promiseTemplateUIConfigObject = function(){
    var prom = $.getJSON('/templates/Template' + getTemplateId() + '.js');
    prom.done(function(data){
      console.log(data);
    })
    return prom;
  };

  function xmlToObject (xmlString) {
    return jxon.stringToJs(xmlString);
  }

  function objectToXml (object) {
    return '<?xml version="1.0" encoding="utf-16"?>\n' + prettyXml(jxon.jsToString(object));
  }
  
  var updateXmlForOrder = function (reactObj) {
    var promise = $.Deferred();
    var orderObject = startingPointTextOnly;
    var topLvlName = getTopLevelXmlName();
    var finalOrderXml = '';

    // Pick a resolution
    if (reactObj.resolutionId === undefined || reactObj.ResolutionId === 0) {
      promise.reject('No ResolutionId was present');
    }
    orderObject[topLvlName].ResolutionId = reactObj.resolutionId;

    // Distribute Text Fields
    if (reactObj.textFields === undefined) {
      promise.reject('No Text Fields were sent');
    }
    for(var key in reactObj.textFields){
      if (reactObj.textFields.hasOwnProperty(key)){
        orderObject[topLvlName].RenderedData.Specs.SpCx.CSp.SpCx.Sp.push({
          $name: key,
          $val: reactObj.textFields[key].value
        });
      }
    }

    //Preview?
    orderObject[topLvlName].IsPreview = reactObj.isPreview;

    finalOrderXml = objectToXml(orderObject);
    xmlContainerDiv().value = finalOrderXml;
    promise.resolve();

    return promise;
  };

  Flixpress.td = {
    getLoadedXmlAsString: getLoadedXmlAsString,
    getLoadedXmlAsObject: getLoadedXmlAsObject,
    xmlToObject: xmlToObject,
    objectToXml: objectToXml,
    promiseTemplateUIConfigObject: promiseTemplateUIConfigObject,
    xmlContainerDiv: xmlContainerDiv,
    getReactStartingData: getReactStartingData,
    updateXmlForOrder: updateXmlForOrder
  };

});
