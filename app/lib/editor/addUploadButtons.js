define([
  "../core",
  "../menu-buttons"
  ],
function( Flixpress, button ) {
  var isDevServer = window.location.hostname.indexOf('files') === 0 ? true : false;
  var audioUrl, videoUrl;
  
  var l = window.location;
  var currentOrigin = l.protocol + '//' + l.host;
  var currentMainDomain = l.host.split('.').splice(-2).join('.');
  
  if (isDevServer) {
    audioUrl = '//search.' + currentMainDomain + '/Audio?d=' + currentOrigin;
    videoUrl = '//search.' + currentMainDomain + '/Video?d=' + currentOrigin;
  } else {
    audioUrl = '//upload.' + currentMainDomain + '/Audio?d=' + currentOrigin;
    videoUrl = '//upload.' + currentMainDomain + '/Video?d=' + currentOrigin;
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
      // For the logic on this regex pattern, see this address: https://regex101.com/r/rK4jF3/1
      var domainMatchPart = currentMainDomain.split('.').join('\\.');
      var regexString = `^https?:\\/\\/(?:[^.]*\\.)?${ domainMatchPart }$`;
      var regexObj = new RegExp(regexString, 'm')
      if (origin.match(regexObj) === null) { return; }
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
