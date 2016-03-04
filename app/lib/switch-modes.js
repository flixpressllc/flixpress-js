define([
  "./core",
  ],
function( Flixpress ) {
  var tasks = {
    on: [],
    off: [],
  };
  var Switch = {};
  
  function registerTask (callback, bucket) {
    bucket.push(callback);
  }
  
  function performTasks (bucket) {
    for (var i = bucket.length - 1; i >= 0; i--) {
      bucket[i]();
    }
  }
  
  Switch.registerOnTask = function (callback) {
    registerTask(callback, tasks.on);
  };
  Switch.registerOffTask = function (callback) {
    registerTask(callback, tasks.off);
  };
  Switch.registerBothTask = function (callback) {
    registerTask(callback, tasks.off);
    registerTask(callback, tasks.on);
  };
  
  
  
  Flixpress.devModeOn = function () {
    Flixpress.mode = 'development';
    performTasks(tasks.on);
    return $.getScript(Flixpress.addServerLocation('/Scripts/flixpress-js/flixpress.js'));
  }

  Flixpress.devModeOff = function () {
    Flixpress.mode = 'production';
    performTasks(tasks.off);
    return $.getScript(Flixpress.addServerLocation('/Scripts/flixpress-js/flixpress.js'));
  }
  
  return Switch;
});
