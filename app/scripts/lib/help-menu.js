define([
  // 'some/module'
  ],
function() { return {helpMenu: function(){
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
  
  var cssFile = '/help/help-menu.css';
  var jsonFile = '/help/help-json.js';

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

  var pathToJWSkin = '/Video/features/flixsix.xml'; // set null for default
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
  var $helpScreen = $('<div id="help-screen"><div class="content"></div></div>');
  var $helpButton = $('<div id="help-button">Show Help</div>');
  var $helpMenu = $('<ul id="help-menu"></ul>');
  var $helpInfo = $('<div id="help-info"></div>');
  var jwplayers = {};
  var jwcount = 0;

  function addNewHeading ( menuObject ) {
    menuObject.$placeholder
     .replaceWith( '<li class="section">'+menuObject.name+'</li>' );
  }

  function addNewTopic (menuObject, $objectToAppend) {
    var $newInfoPane = $('<div class="info-pane-item"></div>');
    var $menuLink = $('<a></a>').html(menuObject.name);

    // store object in data for when user clicks
    $newInfoPane.data('help-content', $objectToAppend);

    // convenience for showing/hiding
    $menuLink.addClass('help-menu-item');
    
    $menuLink.bind('click', function(){
      $helpMenu.find('.help-menu-item').removeClass('active');
      $helpInfo.find('.info-pane-item').removeClass('active');
      $menuLink.addClass('active');
      $newInfoPane.addClass('active');

      if ($newInfoPane.data('help-content') !== 'applied') {
        // we still need to acually append the content.
        // doing this only on the first click should prevent
        // any preloading.

        window.storedData = $newInfoPane.data('help-content');
        $newInfoPane.append($newInfoPane.data('help-content'));
        $newInfoPane.data('help-content', 'applied');
        jwplayerSetup($newInfoPane);
      }
    });

    menuObject.$placeholder.append( $menuLink );
    $helpInfo.append( $newInfoPane );

  }

  function jwplayerSetup($infoPane){
    $infoPane.find('.jwplayer-video').each(function(){
      var id = $(this).attr('id');
      var options = jwplayers[id];
      $jwPromise.done(function(){
        jwplayer(id).setup(options).onTime(function(timing){
          // Detect near end of video
          if (timing.position > (timing.duration - 0.3) ){
              jwplayer(id).seek(0).pause(true);
          }
        });        
      });
    });
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
    var embedHtml = '<h1>' + menuObject.name + '</h1>';
    embedHtml += '<div class="helpVideo"><iframe width="'+ width +'" height="'+ height +'" src="https://www.youtube.com/embed/' + menuObject.data + '?rel=0" frameborder="0" allowfullscreen></iframe></div>';

    addNewTopic(menuObject, $(embedHtml) );
  }

  function newJwDiv () {
    return 'jwnum'+(++jwcount);
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
    var $videoDiv = $('<div class="helpVideo"></div>');
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

  if ($('head link.help-menu').length < 1) {
    $('head').append($('<link rel="stylesheet" type="text/css" href="'+cssFile+'">'));
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
      $helpMenu.append(menuObject.$placeholder);

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
        case('section'):
          addNewHeading(menuObject);
          break;
      }
    });

    $helpButton.bind('click', function(){
      if ($(this).hasClass('active')){
        $(this).trigger('closeHelpMenu');
      } else {
        $(this).trigger('openHelpMenu');
      }
    });

    $(document).bind('cbox_closed', function(){
      $helpScreen.remove();
      $helpButton.remove();
      $(document).unbind('openHelpMenu');
      $(document).unbind('closeHelpMenu');
    });

    $(document).bind('openHelpMenu', function(event){
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
      
      $helpButton.addClass('active').html('Hide Help');
      $helpScreen.addClass('active');

      $(document).bind('click.modal', function(event){
        if (!$(event.target).closest(modalJQSelector).length) {
          // Click was outside the menu
          $(this).trigger('closeHelpMenu');
        }
      });

      pauseUnderlyingPlayer();
    });
    $(document).bind('closeHelpMenu', function(){
      $helpButton.removeClass('active').html('Show Help');
      $helpScreen.removeClass('active');
      $(document).unbind('click.modal');
      
    });

    $helpMenu.on('click','a', function(){
      for (var prop in jwplayers) {
        if (jwplayer(prop).pause !== undefined){
          jwplayer(prop).pause(true);
        }
      }
    });

    $helpScreen.find('.content').append($helpMenu,$helpInfo);
    $(modalJQSelector).append($helpButton, $helpScreen);

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
  });

}}
});
