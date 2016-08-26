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

    var defaultPlaceholderImage = '';
    var DomElement;

    var defaults = {
      width: '100%',            // Pumps width into the `width` attribute of <video>
      height: 'auto',           // Pumps height into the `height` attr of <video>
      aspectRatio: '16:9',      // Does nothing. Probably no longer needed.
      autoplay: false,
      repeat: false,            // Won't work with youtube videos:
                                // you'll have to hard code an embed of a playlist instead
      placeholderImage: true,   // Boolean or the path to an image
      replaceDiv: false,        // Boolean. False nests the video inside the target element
                                // True replaces the target element
      noCache: false,           // prevents browser caching with random number where applicable
      inViewPlay: false,        // currently does nothing
      overlay: false,           // currently does nothing
      hideControls: false       // hides controls on <video>, not YouTube
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

    
    


    // The first argument for SetupVideoPlayer may be either the file URI as a string,
    // or it may also be the options object. If it is the options object, it must
    // contain the `file` or `playlist` keys and the `targetElementId` key.
    if (typeof videoURL !== 'string' && videoURL !== null) {
      options = videoURL;
      videoURL = options.file;
      divId = options.targetElementId;
    }
    
    // The second argument may be the element id as a string, or may be the options
    // object. Same idea as above.
    if (typeof divId !== 'string' && divId !== undefined) {
      options = divId;
      divId = options.targetElementId;
    }
    
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

      // Append some garbage to the URL to prevent caching
      if (options.noCache === true){
        videoURL = videoURL + "?v=" + new Date().valueOf();            
      }
    }
    // function createInview (containerId, playerId) {
    //   jwplayer(playerId).onReady(function(){
    //     var inview = new Waypoint.Inview({
    //       element: $('#'+containerId)[0],
    //       entered: function(){
    //         jwplayer(playerId).play(true);
    //       },
    //       exit: function(){
    //         jwplayer(playerId).pause(true);
    //       },
    //       exited: function(){
    //         jwplayer(playerId).pause(true);
    //       }
    //     });        
    //     // Remove autoplay feature on video completion.
    //     jwplayer(playerId).onComplete(function(something){ inview.destroy(); });
    //     // Remove autoplay feature on first user interaction.
    //     $('#'+containerId).on('click', function(){ inview.destroy(); });
    //   });
    // }
     
    function createHTMLPlayer (){
      var playerId = divId + '-the-video';
      var $video = $('<video id="' + playerId + '" controls></video>')
      var videoElement = $video[0];
      
      videoElement.src = videoURL;
      
      $video.on('click', function (e){
        if(e.offsetY < ($(this).height() - 40)) {
          if (this.paused) {this.play();} else {this.pause();}
        }
      });
      
      videoElement.width = options.width;
      
      if (options.repeat) {
        videoElement.loop = true;
      }
      
      if (options.placeholderImage !== false) {
        videoElement.poster = options.placeholderImage;
      }
      
      if (options.hideControls) {
        videoElement.controls = false;
      }
      
      if (options.autoplay) {
        videoElement.autoplay = true;
      }

      if (options.replaceDiv) {
        $video.attr('id', divId);
        $( '#' + divId).replaceWith( $video )
      } else {
        $( '#' + divId ).html( $video );
      }

      // Adds class to either the container or the actual <video>
      $( '#' + divId ).addClass('flixpressVideoPlayer');

      // // Autoplay on scroll
      // if (options.inViewPlay) {
      //   createInview(divId, playerId);
      // }

      // if (options.overlay !== false){
      //   // Bind player events
      //   var $overlayDiv;
      //   jwplayer(playerId).onReady( function(){
      //     $overlayDiv = setupOverlay(divId, playerId);
      //   });
      //   jwplayer(playerId).onPlay( function(){
      //     $overlayDiv.hide();
      //   });
      //   //player.onPause( showOverlay );
      //   jwplayer(playerId).onComplete( function(){
      //     $overlayDiv.show();
      //   });
      // }
      if (options.playlist !== undefined && options.playlist.items !== undefined) {
        return createHTMLPlaylist (videoElement);
      }
      return videoElement;
    };
    
    
    function createHTMLPlaylist (videoElement) {
      var items = options.playlist.items;
      videoElement.src = items.shift().file;
      
      $(videoElement).on('ended', function () {
        videoElement.autoplay = true;
        if (items.length > 0){
          videoElement.src = items.shift().file;
        }
      })

      return videoElement;
    }
  
    function createYouTubePlayer () {
      var playerId = divId + '-the-video';
      var iframeElement;
      
      YouTubeVideoId = videoURL.match(/(embed\/|watch\/|v=|youtu\.be\/)([A-z0-9]+)/)
      if (YouTubeVideoId == null) { return false }
      YouTubeVideoId = YouTubeVideoId[2];
    
      var optionString = 'rel=0&showinfo=0&autohide=1';
      
      if (options.autoplay) {
        optionString += '&autoplay=1'
      }
      
      if (options.hideControls) {
        optionString += '&controls=0'
      }
      
      if (options.replaceDiv) {
        playerId = divId;
        $( '#' + divId).replaceWith( '<iframe id="' + playerId + '" width="' + options.width + '" height="' + options.height + '" src="https://www.youtube.com/embed/' + YouTubeVideoId + '?' + optionString + '" frameborder="0" allowfullscreen></iframe>' )
      } else {
        $( '#' + divId ).html( '<iframe id="' + playerId + '" width="' + options.width + '" height="' + options.height + '" src="https://www.youtube.com/embed/' + YouTubeVideoId + '?' + optionString + '" frameborder="0" allowfullscreen></iframe>' );
      }
      iframeElement = $('#'+playerId)[0];
      $( '#' + divId ).addClass('flixpressVideoPlayer');
      
      return iframeElement;
    }

    // function setupOverlay (containerId, playerId) {
    //   var $div = $('<div class="jwPlayerOverlay"></div>');
    //   if(typeof options.overlay === 'string') {
    //     $div.html(options.overlay);
    //   } else if (typeof options.overlay.html === 'string') {
    //     $div.html(options.overlay.html);
    //   } else {
    //     $div.html('<a href="/register.aspx" class="btnRed">Register now</a> to start creating incredible video online!');
    //   }
    //   $div.html( $div.html() + '<br><br><a href="#" class="watchAgain btnRed" >Watch Again</a>');
      
    //   var overlayCss = {
    //     position: 'absolute',
    //     margin: '0',
    //     padding: '80px 15px 10px',
    //     background: 'rgba( 0, 0, 0, .9 )',
    //     color: 'white',
    //     fontSize: '24px',
    //     lineHeight: '27px',
    //     border:'1px solid #fff',
    //     textAlign: 'center',
    //     top: 0,
    //     left: 0,
    //     right: 0,
    //     bottom: 0,
    //     display: 'none',
    //     zIndex: 1000000
    //   };
    //   if (typeof options.overlay === 'object' && options.overlay.css !== undefined){
    //     $.extend(overlayCss, options.overlay.css);
    //   }
    //   $div.css(overlayCss);
      
    //   $div.find('a.watchAgain').on('click', function(e){
    //     e.preventDefault();
    //     jwplayer(playerId).play();
    //   });
    //   $div.prependTo($('#'+containerId +' .jwmain'));
    //   return $div;
    // }

    // // unfinished: not used above. Maybe unnecessary
    // function findPlaceholderImage () {
    //   var URLPart = videoURL.substr(0, videoURL.lastIndexOf('.')) || videoURL;
    //   var extensions = ['.png', '.jpg'];
    //   for (var i = extensions.length - 1; i >= 0; i--) {
    //     extensions[i];
    //   };
    // }

    if (videoURL.indexOf('youtube.com') == -1 && videoURL.indexOf('youtu.be') == -1){
      DomElement = createHTMLPlayer();
    } else {
      DomElement = createYouTubePlayer();
    }
    
    return DomElement;
  }
  Flixpress.player = {};
  Flixpress.player.setup = SetupVideoPlayer;
  window.SetupVideoPlayer = SetupVideoPlayer;
});
