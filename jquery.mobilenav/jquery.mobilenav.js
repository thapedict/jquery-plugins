/**
 * jQuery MobileNav
 * Version: 1.0.0
 * Author: Thapelo Moeti
 * License: GNU General Public License v2 or later
 */
 
;(function ($) {
    
    if($ === undefined ) {
        return;
    }
    
    $.fn.mobilenav = function ( options ) {
        return this.each(
            function () {
                new MobileNav($(this), options);
            } 
        );
    };
    
    $.fn.mobilenav.defaults = {
        id:                 'mobilenav-mobile',     // id top be applied to the menu wrapper
        collapsed:          'collapsed',            // class to be used when in mobile mode
        style:              'from-top',             // style to show the mobilenav
        breakAt:            768,                    // maximum screen width to apply collapsed
        parentWidth:        false,                  // collapse on parent width or window width
        beforeMenu:         $.noop,                 // function to run before the showing mobile menu (runs after button click)
        toggleButtonClasses: {                      // classes to toggle when menu button is clicked
            hidden: 'fa-bars',
            shown: 'fa-times'
        },
        beforeSubmenu:      $.noop,                 // before the submenu is shown
        toggleSubmenuClasses: {                     // classes to toggle on arrow when showing submenu
            hidden: 'fa-chevron-down',
            shown: 'fa-chevron-up'
        },
        addHasSubmenuClass: true,                   // whether to add has submenu class
        hasSubmenuClass:    'has-children',         // class for has submenu
        addSubmenuIcon:     true,                   // add submenu icon
    };
    
    MobileNav = function ( BUTTON, options ) {
        
        var MOBILEMENU,     // stores the mobile nav
            FULLMENU,       // refeerence to the full menu
            OPTIONS,        // stores options
            BUTTON_ELEMENT, // reference to the button element (for toggling of classes)
            BREAKAT;        // stores the breakat value
        
        // initialization
        function init() {
            
            /*
            I assume that the value of the 'for' attribute of the toggle button is a selector
            that points to the menu
            FULLMENU and MOBILEMENU objects refer to the nav / wrapper element of the menu
            */
            FULLMENU = $(BUTTON.attr('for'));
            
            if (! FULLMENU ) {
                return; // no use going further because there is no menu
            } else {
                FULLMENU = FULLMENU.eq(0).parent();
            }

            // add class to show main menu has mobilenav
            FULLMENU.addClass('full-menu-mobilenav');
            
            OPTIONS = $.extend({}, $.fn.mobilenav.defaults, options);

            // add class to li with submenu
            if(OPTIONS.addHasSubmenuClass) {
	            FULLMENU.find('li ul').parent().addClass(OPTIONS.hasSubmenuClass);
            }

            if(OPTIONS.addSubmenuIcon) {
                addSubmenuIcon();
                submenuIconClick();
            }

            // clone main menu
            cloneMainMenu();
            
            BUTTON.addClass('mobilenav-menu-toggle-button');

            BUTTON_ELEMENT = BUTTON.hasClass('fas') ? BUTTON: BUTTON.children('.fas').eq(0);
            
            resize();
            
            $(window).resize(resize); // responsive
            
            initButton(); // hanlde the button to show and hide the menu
            
            // if click is not handled hide menu
            $(document).on('click', hideMenu);

            // stop collapsing when nothing is clicked
            MOBILEMENU.on(
                'click', function( e ) {
                    if( e.target.localName == 'a' ) {
                        return;
                    }

                    e.stopPropagation();
                }
            );
        };

        function cloneMainMenu() {
            MOBILEMENU = FULLMENU.clone(true);
            
            // clear classes and id associated with actual menu
            MOBILEMENU.attr('class', '').children('ul').each(
                function () {
                    $(this).attr('id', '').attr('class', '');
                } 
            );
            MOBILEMENU.attr('id', OPTIONS.id);
            
            // hide menu if we are not sliding from sides
            if (isSlide() ) {
                MOBILEMENU.addClass(OPTIONS.style + " does-slide");
                addCloseButtton();
            } else {
                MOBILEMENU.hide();                
            }
            
            $('body').append(MOBILEMENU);
        }
        
        // window resizing
        function resize() {
            
            // hide menu
            hideMenu();
            
            var PW = FULLMENU.width();        // parent width
            var WW = $(window).width();    // window width
            
            // set width
            if (WW > 350 && isSlide() ) {
                MOBILEMENU.width(300);
            }
            
            // set break point
            if (OPTIONS.parentWidth ) {
                BREAKAT = PW;
            } else {
                BREAKAT = WW;
            }
            
            // toggle menu and button
            if (BREAKAT < OPTIONS.breakAt ) {
                
                FULLMENU.hide();
                BUTTON.show();
                
            } else {
                
                FULLMENU.show();
                BUTTON.hide();
                hideMenu();
            }
            
            // position
            if (! isSlide() ) {
                MOBILEMENU.css({ top: ( BUTTON.offset().top + BUTTON.outerHeight() ) + 'px' });
            }
            
        };
        
        // init BUTTON to handle click to toggle menu
        function initButton() {
            
            BUTTON.on(
                'click', function ( e ) {
                
                    e.stopPropagation();
                
                    if (MOBILEMENU.hasClass(OPTIONS.collapsed) ) {
                        hideMenu();
                    } else {
                        showMenu();
                    }
                
                } 
            );
            
        };
        
        // show the menu
        function showMenu() {
            
            if(!isSlide()){
                MOBILEMENU.slideDown();
            }

            BUTTON_ELEMENT.removeClass(OPTIONS.toggleButtonClasses.hidden);
            BUTTON_ELEMENT.addClass(OPTIONS.toggleButtonClasses.shown);
            
            MOBILEMENU.addClass(OPTIONS.collapsed);
            
        };
        
        // hide the menu
        function hideMenu() {
            
            if(!isSlide()){
                MOBILEMENU.slideUp();
            }
            
            BUTTON_ELEMENT.removeClass(OPTIONS.toggleButtonClasses.shown);
            BUTTON_ELEMENT.addClass(OPTIONS.toggleButtonClasses.hidden);
            
            MOBILEMENU.removeClass(OPTIONS.collapsed);

            hideAllSubmenus(MOBILEMENU.find('ul'));
            
        };
        
        // check to see if menu slides from side
        function isSlide() {
            
            if (OPTIONS.style === 'from-left' || OPTIONS.style === 'from-right' ) {
                return true;
            } else {
                return false;
            }
            
        };

        // adds a close button
        function addCloseButtton() {

            MOBILEMENU.prepend('<div id="close-button-wrap"><a id="close-button" class="fas fa-times"></a></div>');
            MOBILEMENU.children('#close-button').on('click', hideMenu);

        }
        
        // add submenus icons
        function addSubmenuIcon() {

            FULLMENU.find('.' + OPTIONS.hasSubmenuClass).each(function(){
                $(this).prepend('<i class="drop-menu-icon fas '+ OPTIONS.toggleSubmenuClasses.hidden +'"></i>');
            });

        };

        // handle the click of a submenu icon
        function submenuIconClick() {

            FULLMENU.find('.drop-menu-icon').on(
                'click',
                function(e){
                    e.stopPropagation();

                    // find submenu
                    var submenu = $(this).siblings('ul');

                    // show or hide
                    if(submenu.hasClass(OPTIONS.collapsed)) {
                        hideSubmenu(submenu);
                    } else {
                        submenu.slideDown().addClass(OPTIONS.collapsed);
                        $(this).removeClass(OPTIONS.toggleSubmenuClasses.hidden).addClass(OPTIONS.toggleSubmenuClasses.shown);
                    }
                }
            );

        }

        // hide all submenuss
        function hideAllSubmenus(menu) {

            menu.find('ul').each(
                function(){
                    hideSubmenu( $(this) );
                }
            );

        }

        // hide a single submenu
        function hideSubmenu(submenu) {

            submenu.slideUp().removeClass(OPTIONS.collapsed);

            var dropMenuIcon = submenu.siblings('.drop-menu-icon');

            if(dropMenuIcon.length) {
                dropMenuIcon.removeClass(OPTIONS.toggleSubmenuClasses.shown);
                dropMenuIcon.addClass(OPTIONS.toggleSubmenuClasses.hidden);
            }

        }
        
        init();
    };
    
})(jQuery);
