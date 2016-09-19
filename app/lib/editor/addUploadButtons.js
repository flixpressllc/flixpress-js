define([
  "../core",
  "../menu-buttons"
  ],
function( Flixpress, button ) {
  function addAudioButton () {
    button.registerMenuButton({
      quadrant: 'topRight',
      url: '//upload.flixpress.com/audio',
      name: 'add-audio',
      inactiveText: 'Add Audio',
      activeText: 'Close Audio'
    });
  }
  Flixpress.editor.addAudioButton = addAudioButton;
  
  function addVideoButton () {
    button.registerMenuButton({
      quadrant: 'topRight',
      url: '//upload.flixpress.com/video',
      name: 'add-video',
      inactiveText: 'Add Video',
      activeText: 'Close Video'
    });
  }
  Flixpress.editor.addVideoButton = addVideoButton;
  
  function addImagesButton () {
    button.registerMenuButton({
      quadrant: 'topRight',
      url: '//upload.flixpress.com/images',
      name: 'add-images',
      inactiveText: 'Add Images',
      activeText: 'Close Images'
    });
  }
  Flixpress.editor.addImagesButton = addImagesButton;
});
