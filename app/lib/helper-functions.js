define([
  
], function() { 
  return {

    toTitleCase: function (str) {
      return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },
    
    slugify: function (str) {
      return str.replace(/\s*/g, '-');
    },
    
    pausePlayerInFrame: function (frame) {
      var context = frame.contentWindow;
      video = context.document.getElementsByTagName('video')[0];
      if (video !== undefined) {
        video.pause();
      }
    }

  };

});

