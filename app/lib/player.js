define([
  "./core",
  "components/waypoints/lib/noframework.waypoints",
  "components/waypoints/lib/shortcuts/inview"
  ],
function( Flixpress ) {

  function SetupVideoPlayer (videoURL, divId, options) {

    /*****************************************************/
    /******        Defaults are defined here        ******/
    /*****************************************************/

    var requiredScriptURL = 'https://jwpsrv.com/library/T7G6AEcEEeOhIhIxOQfUww.js';
    var defaultPlaceholderImage = '';

    var defaults = {
      width: '100%',
      aspectRatio: '16:9',
      autoplay: false,
      repeat: false,
			repeatTriggerFromEnd: 0.3, // seconds from end of video when repeat fires
      playerSkin: '/Video/features/flixsix.xml',
      placeholderImage: true,
      deepOptions: null,
      replaceDiv: false,
      noCache: false,
      inViewPlay: false,
      overlay: false
    };

    /*****************************************************/
    /*****************************************************/
    /***                                                **/
    /***  Changes below this point are not recommended  **/
    /***                                                **/
    /*****************************************************/
    /*****************************************************/

    /*
      Here's why I don't recommend changing things below:
      The rest of this script is an attempt to abstract
      the values entered into the options object being 
      passed into the SetupVideoPlayer function.

      Ideally, the only time you will have to change the
      script below this point is if/when you ditch jwplayer
      for some other way to insert videos directly onto the
      page.

      ~Don
    */

    
    


    // The third argument for SetupVideoPlayer may be a string, boolean, or object.
    // If it is an object, it will be eventually merged with the defaults.
    // If it is a string or boolean, the value will be applied to placeholderImage.
    if (options !== undefined && ( options.substring || options === false || options === true ) ) {
      options = {placeholderImage: options};
    }

    options = $.extend(defaults, options);

    // If placeholder image is set to true, use the default image.
    options.placeholderImage = (options.placeholderImage === true) ? '/images/video-placeholder.png' : options.placeholderImage;

    if (typeof videoURL === 'string'){ // video URL could be null if we are making a slideshow
      // Make sure rendered preview videos are not cached in browser.
      // (Flixpress now writes over old preview videos)
      if (videoURL.slice(-6) === "_P.mp4" ) {
        options.noCache = true;
      }

      // Append some garbage to the URL to prevent caching
      if (options.noCache === true){
        videoURL = videoURL + "?v=" + new Date().valueOf();            
      }
    }
    function createInview (containerId, playerId) {
      jwplayer(playerId).onReady(function(){
        var inview = new Waypoint.Inview({
          element: $('#'+containerId)[0],
          entered: function(){
            jwplayer(playerId).play(true);
          },
          exit: function(){
            jwplayer(playerId).pause(true);
          },
          exited: function(){
            jwplayer(playerId).pause(true);
          }
        });        
        // Remove autoplay feature on video completion.
        jwplayer(playerId).onComplete(function(something){ inview.destroy(); });
        // Remove autoplay feature on first user interaction.
        $('#'+containerId).on('click', function(){ inview.destroy(); });
      });
    }
     
    // These are not abstracted values. These go straight into jwplayer.
    // For example, passing in `repeat: true` as an option to `SetupVideoPlayer`
    // should not correspond to `repeat: true` here. Jwplayer's repeat function
    // sucks and should be attained in another way.
		// Incidentally, the repeat function still needs to be used as a fallback,
		// so I am uncommenting it below as well. But you get the idea.
    var jwDefaults = {
      file: videoURL,
      width: options.width,
      aspectratio: options.aspectRatio,
      autostart: options.autoplay,
      skin: options.playerSkin,
      image: options.placeholderImage,
      height: options.height,
      //primary: 'flash',
      //title: 'Template Preview',
      repeat: options.repeat,
      //stretching: 'exactfit'
    };

    jwOptions = $.extend(jwDefaults, options.deepOptions);

    requiredScriptNotLoaded = (window.jwplayer === undefined);

    if ( requiredScriptNotLoaded ) {
      $.ajaxSetup({cache: true});
      $.getScript(requiredScriptURL, function(){
        createPlayer(jwplayer);
      });
    } else {
      createPlayer(jwplayer);
    }

    function createPlayer (jwplayer){
      var playerId = divId + '-the-video';
      
      if (options.replaceDiv) {
        playerId = divId;
      } else {
        $( '#' + divId ).html( '<div id="' + playerId + '"></div>' );
      }
      
      jwplayer(playerId).setup(jwOptions);
      
      // The repeat property for jwplayer requests the video on
      // each play. Bad for Amazon S3 $$$ and user experience.
      // Instead, we'll detect near end and seek to beginning.
      if (options.repeat) {
        jwplayer(playerId).onTime(function (timing){
          if (timing.position > (timing.duration - options.repeatTriggerFromEnd) ){
            jwplayer(playerId).seek(0);
          }
        });
      }

      // Autoplay on scroll
      if (options.inViewPlay) {
        createInview(divId, playerId);
      }

      if (options.overlay !== false){
        // Bind player events
        var $overlayDiv;
        jwplayer(playerId).onReady( function(){
          $overlayDiv = setupOverlay(divId, playerId);
        });
        jwplayer(playerId).onPlay( function(){
          $overlayDiv.hide();
        });
        //player.onPause( showOverlay );
        jwplayer(playerId).onComplete( function(){
          $overlayDiv.show();
        });
      }
    };

    function setupOverlay (containerId, playerId) {
      var $div = $('<div class="jwPlayerOverlay"></div>');
      if(typeof options.overlay === 'string') {
        $div.html(options.overlay);
      } else {
        $div.html('<a href="/register.aspx" class="btnRed">Register now</a> to start creating incredible video online!');
      }
      $div.html( $div.html() + '<br><br><a href="#" class="watchAgain btnRed" >Watch Again</a>');
      $div.css({
        position: 'absolute',
        margin: '0',
        padding: '80px 15px 10px',
        background: 'rgba( 0, 0, 0, .9 )',
        color: 'white',
        fontSize: '24px',
        lineHeight: '27px',
        border:'1px solid #fff',
        textAlign: 'center',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'none',
        zIndex: 1000000
      });
      $div.find('a.watchAgain').on('click', function(e){
        e.preventDefault();
        jwplayer(playerId).play();
      });
      $div.prependTo($('#'+containerId +' .jwmain'));
      return $div;
    }

    // unfinished: not used above. Maybe unnecessary
    function findPlaceholderImage () {
      var URLPart = videoURL.substr(0, videoURL.lastIndexOf('.')) || videoURL;
      var extensions = ['.png', '.jpg'];
      for (var i = extensions.length - 1; i >= 0; i--) {
        extensions[i];
      };
    }
  }
  Flixpress.player = {};
  Flixpress.player.setup = SetupVideoPlayer;
  window.SetupVideoPlayer = SetupVideoPlayer;
});
