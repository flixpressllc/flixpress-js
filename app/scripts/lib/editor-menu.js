define([
  "./core",
  "./helper-functions"
], function( Flixpress, helper ) { 

  var registerNewMenu = function (name, cssFile, jsonFile) {
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
      cssFile = Flixpress.serverLocation + '/Scripts/flixpress-js/styles/' + name + '-menu.css';
      // Otherwise, it's handled below.
    }

    jsonFile = jsonFile || Flixpress.serverLocation + '/Scripts/flixpress-js/menu-data/' + name + '-json.js';

    // possibly add server locations
    cssFile = (typeof cssFile === 'String') ? Flixpress.addServerLocation(cssFile) : cssFile ;
    jsonFile = (typeof jsonFile === 'String') ? Flixpress.addServerLocation(jsonFile) : jsonFile ;

    /*
     * NOTE: The JSON file above must be perfectly formatted
     * or the script will fail silently. Use a validator.
     */

    //////// Settings
    
    /*
     * `modalJQSelector` is a string representing the selector
     * that jQuery uses to select the colorbox where the menu
     * is populated. It is unlikely this should be changed.
     */
    var modalJQSelector = '#colorbox'; 

    //////// Preferences

    var pathToJWSkin = '/Video/features/flixsix.xml'; // no server location. This is separate from Flixpress-js
    var width = 640; // for video
    var height = 360; // for video
    var flashOrHtml = 'flash';


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * *

     END of Dependencies, Settings, and Preferences

     * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    // Other Local Vars
    var data;
    var $menuScreen = $('<div id="' + name + '-editor-menu-screen" class="editor-menu-screen"><div class="content"></div></div>');
    var $menuButton = $('<div id="' + name + '-editor-menu-button" class="editor-menu-button">Show ' + helper.toTitleCase(name) + '</div>');
    var $menuTopics = $('<ul class="editor-menu-menu"></ul>');
    var $detailsArea = $('<div class="editor-menu-info"></div>');
    var jwplayers = {};
    var ytplayers = {};
    var jwcount = 0;
    var ytcount = 0;

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
          
          var $playersComplete = jwplayerSetup($newInfoPane);
          $playersComplete.done(function(){
            $firstLoadComplete.resolve();
          });
        }
      });

      $firstLoadComplete.done(function(){console.log('loaded')});

      menuObject.$placeholder.append( $menuLink );
      $detailsArea.append( $newInfoPane );

      return {link: $menuLink, details: $newInfoPane, firstLoad: $firstLoadComplete};
    }

    
    function jwplayerSetup($infoPane){
      var $jwPlayers = $infoPane.find('.jwplayer-video');

      if ($jwPlayers.length < 1) {
        return $.Deferred().resolve();
      }

      var allPromises = [];

      $jwPlayers.each(function(){
        var $thisDone = $.Deferred();
        allPromises.push($thisDone);
        
        var id = $(this).attr('id');
        var options = jwplayers[id];
        
        $jwPromise.done(function(){
        
          jwplayer(id).setup(options).onTime(function(timing){
            // Detect near end of video
            if (timing.position > (timing.duration - 0.3) ){
                jwplayer(id).seek(0).pause(true);
            }
          }).onReady(function(){
            $thisDone.resolve();
            // Play on first load only.
            setTimeout(function(){jwplayer(id).play();}, 1);
          });        
        
        });
      });
      
      var $allDone = $.Deferred();
      $.when.apply(this, allPromises).then(function(){ $allDone.resolve() })

      return $allDone;
    }

    function jwplayerPrepare(divId, videoUrl, options) {
      var defaults = {
        autoplay: false,
        width: width, // via 'settings' at top
        height: height, // 'settings'
        skin: pathToJWSkin, // 'settings'
        file: videoUrl,
        primary: flashOrHtml // 'settings'
      };
      options = $.extend(defaults, options);
      jwplayers[divId] = options;

      return '<div class="jwplayer-video" id="'+divId+'"></div>';
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
        ytplayers[ytDiv] = new YT.Player(ytDiv);
      });
    }

    function newJwDiv () {
      return name + '-jwnum'+(++jwcount);
    }

    function newYtDiv () {
      return name + '-ytnum'+(++ytcount);
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
      var $videoDiv = $('<div class="video-wrapper"></div>');
      var jwDiv = newJwDiv();
      var jwHtml = jwplayerPrepare( jwDiv, Flixpress.addServerLocation(menuObject.data.video) );
      var $presetButton = $('<a href="#" class="preset-button">Load Preset</a>');
      // if the xml file starts with a slash, add the server location to the beginning.
      var xmlUrl = Flixpress.addServerLocation(menuObject.data.xml);

      $presetButton.on('click', function(e) {
        e.preventDefault();
        if (window.confirm('Loading a preset will erase any work you\'ve already done in this template. Are you sure you want to continue?')){

          // This line is a circular dependency. However, it is only executed on
          // user interaction (per the 'click' above), so it should work just fine.
          Flixpress.editor.getPresetFile(xmlUrl);
          
          $(this).trigger('close_' + name + '_menu');          
        }
      });
      
      $videoDiv.append(jwHtml);
      $embedHtml.append(title, $videoDiv, $presetButton);

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
      var $videoDiv = $('<div class="video-wrapper"></div>');
      var jwHtml = jwplayerPrepare(newJwDiv(), menuObject.data);

      $videoDiv.append(jwHtml);
      $embedHtml.append(title, $videoDiv);

      addNewTopic(menuObject, $embedHtml );
    }

    /*
     * For creating menu items with the following format:
     * 
     * "name": "Any String", (will become the menu name)
     * "type": "video", (literal)
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
          return jwplayerPrepare( newJwDiv(), link, {title: title} );
        });
        addNewTopic(menuObject, $page);
      }); 
    }

    if ($('head link.editor-menus').length < 1) {
      $('head').append($('<link class="editor-menus" rel="stylesheet" type="text/css" href="' + Flixpress.serverLocation + '/Scripts/flixpress-js/styles/editor-menu.css">'));
    }

    if (cssFile && $('head link.editor-menus[href="' + cssFile + '"]').length < 1) {
      $('head').append($('<link class="editor-menus" rel="stylesheet" type="text/css" href="' + cssFile + '">'));
    }

    var $jwPromise;
    if (window.jwplayer === undefined) {
      $.ajaxSetup({cache: true});
      $jwPromise = $.getScript('http://jwpsrv.com/library/T7G6AEcEEeOhIhIxOQfUww.js');        
    } else {
      $jwPromise = $.Deferred().resolve();
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

      $menuButton.bind('click', function(){
        if ($(this).hasClass('active')){
          $(this).trigger('close_' + name + '_menu');
        } else {
          $(this).trigger('open_' + name + '_menu');
        }
      });

      $(document).bind('cbox_closed', function(){
        $menuScreen.remove();
        $menuButton.remove();
        $(document).unbind('open_' + name + '_menu');
        $(document).unbind('close_' + name + '_menu');
        $(document).unbind('click.offMenu');
      });

      $(document).bind('click.offMenu', function(event){
        var $clicked = $(event.target)
        if (
          // Click was outside the modal box
          !$clicked.closest(modalJQSelector).length ||
          // Click was on a different menu-button 
          ( $clicked.hasClass('editor-menu-button') && $clicked.attr('id') !== name + '-editor-menu-button')
        ) {
          // Close this menu
          $(this).trigger('close_' + name + '_menu');
        }
      });

      $(document).bind('open_' + name + '_menu', function(event){
        // function to pause the template preview video
        var pauseCount = 0;
        function pauseUnderlyingPlayer() {
          var context = $('#cboxWrapper iframe')[0].contentWindow;
          if ( context.jwplayer === undefined ){
            // jwplayer is still setting up from initial page load
            // try a few times to give it some time to setup.
            if (++pauseCount < 8){
              setTimeout(pauseUnderlyingPlayer(), 500);
            }
          } else {
            context.jwplayer().pause(true);
          }
        }
        
        $menuButton.addClass('active').html('Hide ' + helper.toTitleCase(name) );
        $menuScreen.addClass('active');

        pauseUnderlyingPlayer();
      });
      
      $(document).bind('close_' + name + '_menu', function(){
        $menuButton.removeClass('active').html('Show ' + helper.toTitleCase(name) );
        $menuScreen.removeClass('active');
        pauseAllPlayers();
      });

      function pauseAllPlayers () {
        // Pause other jwplayers
        for (var prop in jwplayers) {
          if (jwplayer(prop).pause !== undefined){
            jwplayer(prop).pause(true);
          }
        }
        // Pause Youtube videos
        for (var player in ytplayers) {
          if (ytplayers[player].pauseVideo !== undefined){
            ytplayers[player].pauseVideo();
          }
        }
      };

      $menuTopics.on('click','a', function(){
        pauseAllPlayers();
      });

      $menuScreen.find('.content').append($menuTopics,$detailsArea);
      $(modalJQSelector).find('#'+name+'-editor-menu-button, #'+name+'-editor-menu-screen').remove();
      $(modalJQSelector).append($menuButton, $menuScreen);

      // Hack to get around colorbox setting overflow to hidden on all resizes
      $(window).bind('resize', function(){
        setTimeout(function(){
          $(modalJQSelector).css({overflow: 'visible'});
        }, 3);
      });

    }).always(function(){
      // things to always do...
    }).fail(function(){
      // catch failures
      // really, just do nothing when a menu doesn't exist
    });
  };
  return {registerNewMenu: registerNewMenu};
});
