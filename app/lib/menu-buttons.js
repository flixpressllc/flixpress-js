define([
  "./core",
  "./helper-functions"
], function( Flixpress, helper ) {

  var modalJQSelector = '#colorbox';
  
  // This should change after all buttons are registered
  // through this script. It duplicates functionality in
  // the editor-menu.js file.
  var cssFile = Flixpress.serverLocation() + '/Scripts/flixpress-js/styles/editor-menu.css';
  
  var registeredButtons = {
    topLeft: [],
    topRight: [],
    bottomLeft: [],
    bottomRight: []
  }
  var $topLeft = $('<div id="top-left-menu-quadrant" class="menu-button-quadrant"></div>');
  var $topRight = $('<div id="top-right-menu-quadrant" class="menu-button-quadrant"></div>');
  var $bottomLeft = $('<div id="bottom-left-menu-quadrant" class="menu-button-quadrant"></div>');
  var $bottomRight = $('<div id="bottom-right-menu-quadrant" class="menu-button-quadrant"></div>');

  var quadrants = {
    topLeft: $topLeft,
    topRight: $topRight,
    bottomLeft: $bottomLeft,
    bottomRight: $bottomRight
  }
  /*
    options:
      quadrant: string
        one of 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
        (this is dependent on css styles to work properly)
      onActivate: function
        what happens when you click the button
      onDeactivate: function
        what happens when you click the button again. If no function is specified, the button is assumed to be stateless and will simply run the on-activate function every time it is pressed and will not have any internal state changes for inactive and active, etc.
      url: string
        url to display in the editor.
      name: string
        no spaces. Used for registering/deregistering. never seen by users
      activeText: string
        to be displayed on the button when it is active
      inactiveText: string
        to be displayed on the button when it is inactive. This is how the button starts life.
  */
  function registerMenuButton (options) {
    var url, $iframe = null;
    var s = settings(options);
    
    if (s === false) {
      return false;
    }

    var $button = $('<div id="' + s.nameSlug + '-editor-menu-button" class="editor-menu-button inactive">' + s.inactiveText + '</div>');
    
    function activateThisButton (e) {
      if ($button.hasClass('inactive')){
        s.openUrl(); // won't fire if doesn't exist
        s.onActivate(e);
        
        if (s.isStateless === false) {
          $button.removeClass('inactive')
          $button.addClass('active')
          
          if (s.activeText) {
            $button.text(s.activeText);
          }
        }
      }
    }
    
    function deactivateThisButton (e) {
      if ($button.hasClass('active')){
        s.closeUrl(); // won't fire if doesn't exist
        s.onDeactivate(e);
        $button.removeClass('active')
        $button.addClass('inactive')
        $button.text(s.inactiveText)
      }
    }
    
    function settings (options) {
      var defaults = {
      }
      var s = $.extend({}, defaults, options);
      
      if (s.onActivate === undefined && s.url === undefined) {
        console.error(`The ${s.name} button cannot be registered without an \`onActivate\` function or a url to display.`);
        return false;
      }
      
      s.nameSlug = helper.slugify(s.name);
      
      // Stateless?
      if (s.onDeactivate === undefined && s.url === undefined){
        s.isStateless = true;
        s.onDeactivate = function () {};
      } else {
        s.isStateless = false;
      }
      
      s.hasUrl = s.url === undefined ? false : true;
      
      if (s.onActivate === undefined) {
        s.onActivate = function () {};
      }
      
      if (s.onDeactivate === undefined) {
        s.onDeactivate = function () {};
      }
      
      if (s.hasUrl) {
        s.openUrl = function(){openUrl(s.url)};
        s.closeUrl = closeUrl;
      } else {
        s.openUrl = function () {};
        s.closeUrl = function () {};
      }
      
      addCssToPage();
      
      return s
    }
    
    function openUrl (url) {
      if ($iframe === null) {
        $iframe = $(`<div class="button-iframe-wrapper"><iframe src="${url}"></iframe></div>`);
      }
      $iframe.appendTo($(modalJQSelector));
      helper.pausePlayerInFrame($('.cboxIframe')[0])
    }
    
    function closeUrl () {
      $iframe.detach();
    }
    
    $button.on('click', function(e) {
      if ($button.hasClass('inactive')) {
        activateThisButton(e);
      } else {
        deactivateThisButton(e);
      }
    });
    
    $(document).bind( 'deactivate_menu_buttons', deactivateThisButton );
    $(document).bind('click.offMenu', function(event){
      var $clicked = $(event.target)
      if (
        // Click was outside the modal box
        !$clicked.closest(modalJQSelector).length ||
        // Click was on a different menu-button 
        ( $clicked.hasClass('editor-menu-button') && $clicked.attr('id') !== s.nameSlug + '-editor-menu-button')
      ) {
        // Close this menu
        deactivateThisButton();
      }
    });

    $button.deactivateButton = deactivateThisButton;
    $button.activateButton = deactivateThisButton;
    $button.data('name', s.name);
    
    quadrants[s.quadrant].append($button);
    registeredButtons[s.quadrant].push($button);
    
    activateQuadrant(s.quadrant);
    
    return $button;
  }
  
  function killAllButtons () {
    $.each(registeredButtons, function (quadrantName, buttonArray) {
      buttonArray.map(function($button){
        $button.deactivateButton();
        $button.remove();
      });
      registeredButtons[quadrantName] = [];
      quadrants[quadrantName].detach();
    });
  }
  
  function killButtonByName (name) {
    $.each(registeredButtons, function (i, quadrant){
      $.each(quadrant, function (i, $button){
        if ($button.data('name') === name) {
          $button.deactivateButton();
          $button.remove();
          quadrant.splice(i,1);
        }
      });
    });
  }
  
  function activateQuadrant (qName) {
    $quadrant = quadrants[qName];
    $quadrant.appendTo($(modalJQSelector));
  }
  
  function addCssToPage () {
    if (cssFile && $('head link.editor-menus[href="' + cssFile + '"]').length < 1) {
      $('head').append($('<link class="editor-menus" rel="stylesheet" type="text/css" href="' + cssFile + '">'));
    }
  }
  
  function deactivateButtonByName (name) {
    $.each(registeredButtons, function (i, quadrant){
      $.each(quadrant, function (i, $button){
        if ($button.data('name') === name) {
          $button.deactivateButton();
        }
      });
    });
  }

  function activateButtonByName (name) {
    $.each(registeredButtons, function (i, quadrant){
      $.each(quadrant, function (i, $button){
        if ($button.data('name') === name) {
          $button.activateButton();
        }
      });
    });
  }

  $(document).bind( 'cbox_closed', function () {
    killAllButtons();
    $(document).unbind('click.offMenu');
  });
  
  return {
    registerMenuButton: registerMenuButton,
    killAllMenuButtons: killAllButtons,
    killButtonByName: killButtonByName,
    deactivateButtonByName: deactivateButtonByName,
    activateButtonByName: activateButtonByName
  }
  
});
