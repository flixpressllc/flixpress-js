define([
  "../core",
  "../menu-buttons"
  ],
function( Flixpress, button ) {
  var isDevServer = window.location.hostname.indexOf('files') === 0 ? true : false;
  var audioUrl, videoUrl;
  if (isDevServer) {
    audioUrl = '//search.digital-edge.biz/TestAudio';
    videoUrl = '//search.digital-edge.biz/TestVideo';
  } else {
    audioUrl = '//upload.flixpress.com/Audio';
    videoUrl = '//upload.flixpress.com/Video';
  }
  function addAudioButton () {
    button.registerMenuButton({
      quadrant: 'topRight',
      url: audioUrl,
      name: 'add-audio',
      inactiveText: 'Add Audio',
      activeText: 'Close Audio'
    });
  }
  Flixpress.editor.addAudioButton = addAudioButton;
  
  function addVideoButton () {
    button.registerMenuButton({
      quadrant: 'topRight',
      url: videoUrl,
      name: 'add-video',
      inactiveText: 'Add Video',
      activeText: 'Close Video'
    });
  }
  Flixpress.editor.addVideoButton = addVideoButton;
});
