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
      activeText: 'Cancel Audio'
    });
  }
  Flixpress.editor.addAudioButton = addAudioButton;
});
