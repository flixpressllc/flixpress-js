define([
  "./core",
  ],
function( Flixpress ) {
  var tasks = {
    beforeOn: [],
    afterOn: [],
    beforeOff: [],
    afterOff: []
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
  
  function setAfterTasks () {
    window.flixpressAfterModeSwitchTasks = {
      afterOn: tasks.afterOn,
      afterOff: tasks.afterOff
    };
  }
  function getAfterTasks () {
    if (window.flixpressAfterModeSwitchTasks !== undefined) {
      tasks.afterOn = window.flixpressAfterModeSwitchTasks.afterOn;
      tasks.afterOff = window.flixpressAfterModeSwitchTasks.afterOff;
    }
  }
  
  function performAfterTasks () {
    getAfterTasks();
    if (Flixpress.mode === 'development'){
      performTasks(tasks.afterOn);
    } else {
      performTasks(tasks.afterOff);
    }
  }
  
  Switch.registerBeforeOnTask = function (callback) {
    registerTask(callback, tasks.beforeOn);
  };
  Switch.registerBeforeOffTask = function (callback) {
    registerTask(callback, tasks.beforeOff);
  };
  Switch.registerBeforeBothTask = function (callback) {
    registerTask(callback, tasks.beforeOff);
    registerTask(callback, tasks.beforeOn);
  };
  
  Switch.registerAfterOnTask = function (callback) {
    registerTask(callback, tasks.afterOn);
  };
  Switch.registerAfterOffTask = function (callback) {
    registerTask(callback, tasks.afterOff);
  };
  Switch.registerAfterBothTask = function (callback) {
    registerTask(callback, tasks.afterOff);
    registerTask(callback, tasks.afterOn);
  };
  
  
  Flixpress.devModeOn = function () {
    Flixpress.mode = 'development';
    performTasks(tasks.beforeOn);
    return $.getScript(Flixpress.addServerLocation('/Scripts/flixpress-js/flixpress.js'));
  }

  Flixpress.devModeOff = function () {
    Flixpress.mode = 'production';
    performTasks(tasks.beforeOff);
    return $.getScript(Flixpress.addServerLocation('/Scripts/flixpress-js/flixpress.js'));
  }
  
  Flixpress.loaded.done(performAfterTasks);
  
  return Switch;
});
