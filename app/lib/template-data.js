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

  var emptyRenderedDataNode = {
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
      }
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

  Flixpress.td = {
    getLoadedXmlAsString: getLoadedXmlAsString,
    getLoadedXmlAsObject: getLoadedXmlAsObject,
    xmlToObject: xmlToObject,
    objectToXml: objectToXml,
    promiseTemplateUIConfigObject: promiseTemplateUIConfigObject,
    xmlContainerDiv: xmlContainerDiv
  };

});
