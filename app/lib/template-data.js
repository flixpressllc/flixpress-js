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

  var startingPoint = {
    OrderRequestOfTextOnlyRndTemplate: {
      "$xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "$xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      ResolutionId: 0,
      RenderedData: {
        Specs: {
          $name: "Specs",
          $val: "",
          SpCx: {
            CSp: []
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

  function clone(obj) {
    return target = JSON.parse(JSON.stringify(obj));
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

    var what = Object.prototype.toString;
    if (xmlObj.Specs !== undefined) {
      result.nameValuePairs = [];
      if (what.call(xmlObj.Specs.SpCx.CSp) !== '[object Array]'){
        // Make it into an array for consistency
        xmlObj.Specs.SpCx.CSp = [clone(xmlObj.Specs.SpCx.CSp)]
      }
      for (var i = 0; i < xmlObj.Specs.SpCx.CSp.length; i++) {
        var currentFieldsArray = xmlObj.Specs.SpCx.CSp[i].SpCx.Sp;
        var name = '';
        var value = '';
        for ( var j = 0; currentFieldsArray.length > j; j++ ) {
          name = currentFieldsArray[j].$name;
          value = currentFieldsArray[j].$val;
          result.nameValuePairs.push({name: name, value: value});
        }
      }
    }
    
    return result;
  };

  var getReactStartingData = function () {
    // Hack to get around server side code for now...
    if($('head').find('meta[content="width=device-width, initial-scale=1.0"]').length < 1) {
      $('head').append($('<meta name="viewport" content="width=device-width, initial-scale=1.0">'));
    }
    // Ok. Onward...
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
    var orderObject = clone(startingPoint);
    var topLvlName = getTopLevelXmlName();
    var finalOrderXml = '';

    // Pick a resolution
    if (reactObj.resolutionId === undefined || reactObj.ResolutionId === 0) {
      promise.reject('No ResolutionId was present');
    }
    orderObject[topLvlName].ResolutionId = reactObj.resolutionId;

    // copy audio
    if (reactObj.audioInfo === undefined) {
      promise.reject('No audioInfo was present');
    }
    
    orderObject[topLvlName].RenderedData.AudioInfo = changePropsInitialCase(reactObj.audioInfo, 'UpperFirst');

    // Distribute Specs
    if (reactObj.ui === undefined) {
      promise.reject('No Specs were sent');
    }
    for (var i = 0; i < reactObj.ui.length; i++) {
      
      for (var key in reactObj.ui[i]) {
        if (reactObj.ui[i].hasOwnProperty(key)){
          var SpArray = [];
          
          for (var j = 0; j < reactObj.ui[i][key].length; j++) {
             SpArray.push({
              $name: reactObj.ui[i][key][j].name,
              $val: reactObj.ui[i][key][j].value
            });
          }
          
          orderObject[topLvlName].RenderedData.Specs.SpCx.CSp.push({
            $name: key,
            $val: 'CD|' + key + '|',
            SpCx: {
              Sp: SpArray
            }
          });

        }
      }
      
    }

    //Preview?
    orderObject[topLvlName].IsPreview = reactObj.isPreview;

    finalOrderXml = objectToXml(orderObject);
    xmlContainerDiv().value = finalOrderXml;
    promise.resolve();

    return promise;
  };
  
  var getCatSongs = function (categoryId, username) {
    var audioUrl = 'https://ws.flixpress.com/AudioWebService.asmx/GetAudio';
    return $.ajax({
      url: audioUrl,
      data: {username: username, categoryId: categoryId, page:1, pageSize: 1000},
      dataType: 'xml',
      type: 'GET'
    });
    
  }
  
  var getAudioOptions = function (username) {
    var optionsPromise = $.Deferred();
    // https://ws.flixpress.com/AudioWebService.asmx/GetAudio?categoryId=2&page=1&pageSize=100&username=bowdo
    
    // https://ws.flixpress.com/AudioWebService.asmx/GetCategoryTree
    
    var categoryUrl = 'https://ws.flixpress.com/AudioWebService.asmx/GetCategoryTree';
    var customUrl = 'https://ws.flixpress.com/CustomAudioWebService.asmx/GetCustomAudio';
    
    function whenAll(arrayOfPromises) {
      return jQuery.when.apply(jQuery, arrayOfPromises).then(function() {
        return Array.prototype.slice.call(arguments, 0);
      });
    };

    var categoriesObj = {};
    var customAudioArr = [];
    var haveAllCats = $.Deferred();
    var haveAllCustom = $.Deferred();
    
    var getCats = $.ajax({
      url: categoryUrl,
      dataType: 'xml',
      type: 'GET'
    }).done(function(result){
      var getAllCats = [];
      var categories = jxon.xmlToJs(result).ArrayOfCategory.Category.SubCategories.Category;

      $.each(categories, function(arrPos, category){
        var catSongs = getCatSongs(category.Id, username)
        getAllCats.push(catSongs);
        catSongs.done(function(result){
          categoriesObj[category.Name] = {};
          categoriesObj[category.Name].id = category.Id;
          categoriesObj[category.Name].songs = jxon.xmlToJs(result).ResultSetOfAudio.Records.Audio;
        });
      });
      
      whenAll(getAllCats).done(function(){
        haveAllCats.resolve();
      })
    });
    
    var getCustom = $.ajax({
      url: customUrl,
      dataType: 'xml',
      type: 'GET',
      data: {username: username, page:1, pageSize: 1000}
    }).done(function (result) {
      var songs = jxon.xmlToJs(result).ResultSetOfCustomAudio.Records.CustomAudio;
      for (var i = 0; i < songs.length; i++) {
        customAudioArr.push(songs[i]);
      }
      haveAllCustom.resolve();
    });
    
    $.when(haveAllCats, haveAllCustom).then(function () {
      optionsPromise.resolve({categories:categoriesObj, customAudio: customAudioArr});
    });
    
    return optionsPromise;
  };

  Flixpress.td = {
    getLoadedXmlAsString: getLoadedXmlAsString,
    getLoadedXmlAsObject: getLoadedXmlAsObject,
    xmlToObject: xmlToObject,
    objectToXml: objectToXml,
    promiseTemplateUIConfigObject: promiseTemplateUIConfigObject,
    xmlContainerDiv: xmlContainerDiv,
    getReactStartingData: getReactStartingData,
    updateXmlForOrder: updateXmlForOrder,
    getAudioOptions: getAudioOptions
  };

});
