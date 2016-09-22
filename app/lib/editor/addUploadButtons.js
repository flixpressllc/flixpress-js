define([
  "../core",
  "../menu-buttons"
  ],
function( Flixpress, button ) {
  var isDevServer = window.location.hostname.indexOf('files') === 0 ? true : false;
  var audioUrl, videoUrl;
  var l = window.location;
  var currentHost = l.protocol + '//' + l.host
  if (isDevServer) {
    audioUrl = '//search.digital-edge.biz/Audio?d=' + currentHost;
    videoUrl = '//search.digital-edge.biz/Video?d=' + currentHost;
  } else {
    audioUrl = '//upload.flixpress.com/Audio?d=' + currentHost;
    videoUrl = '//upload.flixpress.com/Video?d=' + currentHost;
  }
  function addAudioButton (userToken) {
    var url = audioUrl + '&uid=' + userToken;
    var theButton = button.registerMenuButton({
      quadrant: 'topRight',
      url: url,
      name: 'add-audio',
      inactiveText: 'Add Audio',
      activeText: 'Close Audio',
      onActivate: function(){ createCloseListener(theButton, 'add-audio'); },
      onDeactivate: function(){ killCloseListener('add-audio'); }
    });
    
  }
  
  function addVideoButton (userToken) {
    var url = videoUrl + '&uid=' + userToken;
    var theButton = button.registerMenuButton({
      quadrant: 'topRight',
      url: url,
      name: 'add-video',
      inactiveText: 'Add Video',
      activeText: 'Close Video',
      onActivate: function(){ createCloseListener(theButton, 'add-video'); },
      onDeactivate: function(){ killCloseListener('add-video'); }
    });
  }
  
  function createCloseListener (buttonToClose, identifyingSlug) {
    var callingSource, callingOrigin;
    
    // messages received must be strings that look like "close: name-of-button". That's it.
    function receiveMessage (event) {
      var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
      // For the logic on this regex pattern, see this address: https://regex101.com/r/pK5iU7/4
      if (origin.match(/^https?:\/\/(?:[^.]*\.)?(?:flixpress\.com|digital-edge\.biz)$/m) === null) { return; }
      var data = event.data || event.originalEvent.data;
      var noMatch = data !== `close: ${identifyingSlug}` ? true : false;
      if (noMatch) { return; }
      
      buttonToClose.deactivateButton();
    }
    $(window).on(`message.${identifyingSlug}`, receiveMessage);
  }
  
  function killCloseListener (identifyingSlug) {
    $(window).off(`message.${identifyingSlug}`);
  }

  Flixpress.editor.addAudioButton = addAudioButton;
  Flixpress.editor.addVideoButton = addVideoButton;
});
