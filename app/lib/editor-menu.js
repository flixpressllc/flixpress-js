define([
  "./core",
  "./helper-functions",
  "./menu-buttons",
  "./player"
], function( Flixpress, helper, button ) { 

  //////// Settings
  
  /*
   * `modalJQSelector` is a string representing the selector
   * that jQuery uses to select the colorbox where the menu
   * is populated. It is unlikely this should be changed.
   */
  var modalJQSelector = '#colorbox'; 

  //////// Preferences

  var width = 640; // for video
  var height = 360; // for video



  var registerNewMenu = function (name, cssFile, jsonFile, buttonQuadrant) {
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * *

     Dependencies, Settings, and Preferences

     -------------------------------------------------------

     Dependencies: paths to files that must be accurate.
     Settings: Variable values that must be correct
     Preferences: Alter these as simply a matter of tase.

     * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    //////// Dependencies
    
    if (cssFile === true ){
      cssFile = Flixpress.serverLocation() + '/Scripts/flixpress-js/styles/' + name + '-menu.css';
      // Otherwise, it's handled below.
    }

    jsonFile = jsonFile || Flixpress.serverLocation() + '/Scripts/flixpress-js/menu-data/' + name + '-json.js';

    // possibly add server locations
    cssFile = (typeof cssFile === 'String') ? Flixpress.addServerLocation(cssFile) : cssFile ;
    jsonFile = (typeof jsonFile === 'String') ? Flixpress.addServerLocation(jsonFile) : jsonFile ;

    /*
     * NOTE: The JSON file above must be perfectly formatted
     * or the script will fail silently. Use a validator.
     */

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * *

     END of Dependencies, Settings, and Preferences

     * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    // Other Local Vars
    var data;
    var $menuScreen = $('<div id="' + name + '-editor-menu-screen" class="editor-menu-screen"><div class="content"></div></div>');
    var $menuTopics = $('<ul class="editor-menu-menu"></ul>');
    var $detailsArea = $('<div class="editor-menu-info"></div>');
    var fpPlayers = {};
    var ytPlayers = {};
    var fpCount = 0;
    var ytCount = 0;
    var jsonFileDir = jsonFile.replace(/\/+[^\/]*$/, '');

    function addNewHeading ( menuObject ) {
      menuObject.$placeholder
       .replaceWith( '<li class="section">'+menuObject.name+'</li>' );
    }

    function addNewTopic (menuObject, $objectToAppend) {
      var $newInfoPane = $('<div class="info-pane-item"></div>');
      var $menuLink = $('<a></a>').html(menuObject.name);

      // store object in data for when user clicks
      $newInfoPane.data('' + name + '-content', $objectToAppend);

      // convenience for showing/hiding
      $menuLink.addClass('editor-menu-menu-item');
      
      var $firstLoadComplete = $.Deferred();

      $menuLink.bind('click', function(){
        $menuTopics.find('.editor-menu-menu-item').removeClass('active');
        $detailsArea.find('.info-pane-item').removeClass('active');
        $menuLink.addClass('active');
        $newInfoPane.addClass('active');

        if ($newInfoPane.data('' + name + '-content') !== 'applied') {
          // we still need to acually append the content.
          // doing this only on the first click should prevent
          // any preloading.

          $newInfoPane.append($newInfoPane.data('' + name + '-content'));
          $newInfoPane.data('' + name + '-content', 'applied');
          
          var $playersComplete = fpPlayerSetup($newInfoPane);
          $playersComplete.done(function(){
            $firstLoadComplete.resolve();
          });
        }
      });

      $firstLoadComplete.done(function(){
        // Do any first load functions here
      });

      menuObject.$placeholder.append( $menuLink );
      $detailsArea.append( $newInfoPane );

      return {link: $menuLink, details: $newInfoPane, firstLoad: $firstLoadComplete};
    }

    
    function fpPlayerSetup($infoPane){
      var $fpPlayers = $infoPane.find('.fp-player-video');

      if ($fpPlayers.length < 1) {
        return $.Deferred().resolve();
      }

      var allPromises = [];

      $fpPlayers.each(function(){
        var $thisDone = $.Deferred();
        allPromises.push($thisDone);
        
        var id = $(this).attr('id');
        var options = fpPlayers[id];
        var file = options.file;
        
        Flixpress.player.setup( file, id, options );
        // jwplayer(id).setup(options).onReady(function(){
        //   // Play on first load only.
        //   setTimeout(function(){jwplayer(id).play();}, 1);
        // });        
        $thisDone.resolve();
        
      });
      
      var $allDone = $.Deferred();
      $.when.apply(this, allPromises).then(function(){ $allDone.resolve() })

      return $allDone;
    }

    function fpPlayerPrepare(divId, videoUrl, options) {
      var defaults = {
        autoplay: false,
        width: width, // via 'settings' at top
        height: height, // 'settings'
        file: videoUrl,
        replaceDiv: true
      };
      options = $.extend(defaults, options);
      fpPlayers[divId] = options;

      return '<div class="fp-player-video" id="'+divId+'"></div>';
    }

    /*
     * For creating menu items with the following format:
     * 
     * "name": "Any String", (will become the menu name)
     * "type": "youTube", (literal)
     * "data": "YouTubeVideoID" (example: 6a8TpnohDks)
     *
     */
    function createYouTubeLink (menuObject) {
      // Let's make sure we've got the youtube api ready
      if ($('script[src="https://www.youtube.com/iframe_api"]').length < 1) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      var ytDiv = newYtDiv();

      var embedHtml = '<h1>' + menuObject.name + '</h1>';
      embedHtml += '<div class="video-wrapper"><iframe id="'+ ytDiv +'" width="'+ width +'" height="'+ height +'" src="https://www.youtube.com/embed/' + menuObject.data + '?rel=0&autoplay=true&enablejsapi=1" frameborder="0" allowfullscreen></iframe></div>';

      var addedTopic = addNewTopic(menuObject, $(embedHtml) );
      addedTopic.firstLoad.done(function(){
        ytPlayers[ytDiv] = new YT.Player(ytDiv);
      });
    }

    function newFpDiv () {
      return name + '-fpnum'+(++fpCount);
    }

    function newYtDiv () {
      return name + '-ytnum'+(++ytCount);
    }
    
    // You may pass a string to this function. Anything else creates an empty div.
    // Returns jQuery
    function createFpDiv (url) {
      if (typeof url !== 'string' || url.length === 0) {
        return $('');
      }
      
      var $videoDiv = $('<div class="video-wrapper"></div>');
      var fpDiv = newFpDiv();
      var fpHtml = fpPlayerPrepare( fpDiv, Flixpress.smartUrlPrefix(url, jsonFileDir) );
      
      return $videoDiv.append(fpHtml);
    }

    /*
     * For creating menu items with the following format:
     * 
     * "name": "Any String", (will become the menu name)
     * "type": "preset", (literal)
     * "data": {
     *    "video": "/url/to/video.mp4", // if forward slash starts the string, Flixpress.serverLocation will be prepended
     *    "xml": "/url/to/file.xml"     // if forward slash starts the string, Flixpress.serverLocation will be prepended
     */
    function createPresetDetails (menuObject) {
      var $embedHtml = $('<div></div>');
      var title = '<h1>' + menuObject.name + '</h1>';
      var $presetButton = $('<a href="#" class="preset-button">Load Preset</a>');
      // if the xml file starts with a slash, add the server location to the beginning.
      var xmlUrl = Flixpress.smartUrlPrefix(menuObject.data.xml, jsonFileDir);
      var description = menuObject.data.description;
      description = (description === undefined) ? '' : '<div class="preset-description">' + description + '</div>';

      $presetButton.on('click', function(e) {
        e.preventDefault();
        if (window.confirm('Loading a preset will erase any work you\'ve already done in this template. Are you sure you want to continue?')){

          // This line is a circular dependency. However, it is only executed on
          // user interaction (per the 'click' above), so it should work just fine.
          Flixpress.editor.getPresetFile(xmlUrl);
          
          $(document).trigger('close_' + name + '_menu');          
        }
      });
      
      $embedHtml.append(title, createFpDiv(menuObject.data.video), description, $presetButton);

      var addedTopic = addNewTopic(menuObject, $embedHtml );

      addedTopic.link.on('click', function(){
        addedTopic.firstLoad.done(function(){ 
          // Anything that needs completing after the topic is completely loaded goes here
          // It will still fire on every click, but it will wait the first time for load to
          // complete

        })
      })
    }

    /*
     * For creating menu items with the following format:
     * 
     * "name": "Any String", (will become the menu name)
     * "type": "video", (literal)
     * "data": "/url/to/video.mp4" (example: /Video/help/basic/adding-audio.mp4)
     *
     */
    function createVideoLink (menuObject) {
      var $embedHtml = $('<div></div>');
      var title = '<h1>' + menuObject.name + '</h1>';
      $embedHtml.append(title, createFpDiv(menuObject.data));
      addNewTopic(menuObject, $embedHtml );
    }

    /*
     * For creating menu items with the following format:
     * 
     * "name": "Any String", (will become the menu name)
     * "type": "html", (literal)
     * "data": "/url/to/file.html" (example: /DonContentPasteboard/pro-overview.html)
     *
     */
    function createHtmlPane (menuObject) {
      var htmlRequest = $.get(menuObject.data);
      htmlRequest.done(function(data){
        var $page = $('<div></div>').html(data);
        $page.find('a[href$=mp4]').replaceWith(function(){
          var title = $(this).html();
          var link = $(this).attr('href');
          return fpPlayerPrepare( newFpDiv(), link, {title: title} );
        });
        addNewTopic(menuObject, $page);
      }); 
    }

    if ($('head link.editor-menus').length < 1) {
      $('head').append($('<link class="editor-menus" rel="stylesheet" type="text/css" href="' + Flixpress.serverLocation() + '/Scripts/flixpress-js/styles/editor-menu.css">'));
    }

    if (cssFile && $('head link.editor-menus[href="' + cssFile + '"]').length < 1) {
      $('head').append($('<link class="editor-menus" rel="stylesheet" type="text/css" href="' + cssFile + '">'));
    }

    //handle errors (usually in json file formatting)
    if (Flixpress.mode === 'development'){
      $( document ).ajaxError(function( event, request, settings, thrownError ) {
        if (settings.url === jsonFile) {
          console.warn('Couldn\'t read a JSON file: ' + jsonFile + '. If you expected the '+ name +' menu to load, be sure a JSON file is present at that location and that it is perfectly formatted JSON.');
        }
      });
    }

    $.get(jsonFile, function(fetchedData){
      data = fetchedData;
    },'json').done(function(){
      
      var $li = $('<li></li>');
      
      $.each(data, function(i,menuObject){
      
        menuObject.$placeholder = $li.clone();
        $menuTopics.append(menuObject.$placeholder);

        switch (menuObject.type) {
          case('youTube'):
            createYouTubeLink(menuObject);
            break;
          case('video'):
            createVideoLink(menuObject);
            break;
          case('html'):
            createHtmlPane(menuObject);
            break;
          case('preset'):
            createPresetDetails(menuObject);
            break;
          case('section'):
            addNewHeading(menuObject);
            break;
        }
      });

      $(document).bind('cbox_closed', function(){
        $menuScreen.remove();
        $(document).unbind('open_' + name + '_menu');
        $(document).unbind('close_' + name + '_menu');
      });

      $(document).bind('open_' + name + '_menu', function(event){
        $menuScreen.addClass('active');

        helper.pausePlayerInFrame($('.cboxIframe')[0]);
      });
      
      $(document).bind('close_' + name + '_menu', function(){
        $menuScreen.removeClass('active');
        pauseAllPlayers();
      });

      function pauseAllPlayers () {
        // Pause other fpPlayers
        for (var prop in fpPlayers) {
          if ($('#' + prop).pause !== undefined){
            $('#' + prop).pause();
          }
        }
        // Pause Youtube videos
        for (var player in ytPlayers) {
          if (ytPlayers[player].pauseVideo !== undefined){
            ytPlayers[player].pauseVideo();
          }
        }
      };

      $menuTopics.on('click','a', function(){
        pauseAllPlayers();
      });

      $menuScreen.find('.content').append($menuTopics,$detailsArea);
      $(modalJQSelector).find('#'+name+'-editor-menu-button, #'+name+'-editor-menu-screen').remove();
      $(modalJQSelector).append($menuScreen);

      button.registerMenuButton({
        quadrant: buttonQuadrant || 'topRight',
        name: name,
        inactiveText: 'Show ' + helper.toTitleCase(name),
        activeText: 'Hide ' + helper.toTitleCase(name),
        onActivate: function(){ $(document).trigger('open_' + name + '_menu'); },
        onDeactivate: function(){ $(document).trigger('close_' + name + '_menu'); }
      });
      
      // Hack to get around colorbox setting overflow to hidden on all resizes
      $(window).bind('resize', function(){
        setTimeout(function(){
          $(modalJQSelector).css({overflow: 'visible'});
        }, 3);
      });

    });
  };
  
  var deregisterMenu = function (name) {
    if (typeof name !== 'string') {
      return;
    }
    $(modalJQSelector).find('#'+name+'-editor-menu-screen').remove();
    button.killButtonByName(name);
    $(document).unbind('open_' + name + '_menu');
    $(document).unbind('close_' + name + '_menu');
  };

  return {
    registerNewMenu: registerNewMenu,
    deregisterMenu: deregisterMenu
  };
});
