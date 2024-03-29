/**
 * jQuery MobileNav
 * Version: 1.1.0
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
        id:                 'mobilenav-mobile-wrap',// id top be applied to the menu wrapper
        collapsed:          'collapsed',            // class to be used when mobile menu shown
        style:              'from-top',             // style to show the mobilenav
        breakAt:            768,                    // maximum screen width to apply collapsed
        parentWidth:        false,                  // collapse on parent width or window width
        beforeMenu:         $.noop,                 // function to run before the showing mobile menu (runs after button click)
        beforeSubmenu:      $.noop,                 // function to run before the submenu is shown
        // classes to toggle when button is shown (mobile mode)
        // [classes toggled on button element]
        toggleButtonShownClasses: {
            hidden: 'hidden',
            shown: 'shown'
        },
        // classes to toggle when menu button is clicked (mobile menu shown)
        // [classes toggled on button element]
        toggleMenuShownClasses: {
            hidden: 'fa-bars',
            shown: 'fa-times'
        },
        // classes to toggle on arrow when showing submenu
        // [classes toggle on drop icon]
        toggleSubmenuClasses: {
            hidden: 'fa-chevron-down',
            shown: 'fa-chevron-up'
        },
        hasSubmenuClass:    'has-submenu',         // class for has submenu
        addSubmenuIcon:     true,                   // add submenu icon
        clsDropMenuIcon:    'drop-menu-icon',       // class applied to drop submenu icon
    };
    
    MobileNav = function ( BUTTON, options ) {
        var MOBILEMENU,     // to store the mobile nav (wrapper of ul)
            FULLMENU,       // to store to the full menu (wrapper of ul)
            OPTIONS,        // stores options
            BREAKAT,        // stores the breakat value
            FULLMENU_SUB_ICONS, // store fullmenu submenu icons
            FULLMENU_FIRST_LEVEL, // store all first level li
            CLS_HAS_SUBMENU,    // class selector for has-submenu
            CLS_DROP_MENU_ICON; // class selector for drop-menu-icon
        
        /**
         * Initialize it
         */
        function init() {
            // The BUTTON for attribute should point (be a selector) to the full menu
            FULLMENU = $( BUTTON.attr('for') );
            
            if (! FULLMENU.length > 0) {
                return; // no use going further because there is no menu
            } else {
                FULLMENU_FIRST_LEVEL = FULLMENU.children();
                FULLMENU = FULLMENU.eq(0).addClass('mobilenav-full-menu').parent();
            }

            // add tab stop
            BUTTON.attr('tabindex','0');
            
            // add class to show main menu has mobilenav
            FULLMENU.addClass('mobilenav-full-menu-wrap');
            
            OPTIONS = $.extend({}, $.fn.mobilenav.defaults, options);

            // add class to li with submenu
            FULLMENU.find('li ul').parent().addClass(OPTIONS.hasSubmenuClass);
            CLS_HAS_SUBMENU = '.' + OPTIONS.hasSubmenuClass;

            if(CLS_HAS_SUBMENU.indexOf('.')!==0) {
                CLS_HAS_SUBMENU = '.' + CLS_HAS_SUBMENU;
            }

            if(OPTIONS.addSubmenuIcon) {
                CLS_DROP_MENU_ICON = OPTIONS.clsDropMenuIcon;

                if(CLS_DROP_MENU_ICON.indexOf('.')!==0) {
                    CLS_DROP_MENU_ICON = '.' + CLS_DROP_MENU_ICON;
                }

                addSubmenuIcon();
                submenuIconClick();
            }

            // clone main menu
            cloneMainMenu();
            
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
            
            // run the resize
            resize();
        };

        /**
         * Clone the main menu.
         */
        function cloneMainMenu() {
            MOBILEMENU = FULLMENU.clone(true);
            
            // clear classes and id from fullmenu and add mobile menu classes
            MOBILEMENU.attr('id', OPTIONS.id).attr('class', 'mobilenav-mobile-menu-wrap').children('ul').each(
                function () {
                    $(this).attr('id', '').attr('class', 'mobilenav-mobile-menu');
                } 
            );
            
            
            MOBILEMENU.addClass(OPTIONS.style + " does-slide");
            addCloseButtton();
            
            MOBILEMENU.hide();
                
            
            $('body').append(MOBILEMENU);
        }
        
        /**
         * Handling window resizing event.
         */
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
        
        /**
         * Initialize the Button to handle events.
         */
        function initButton() {

            BUTTON.addClass('mobilenav-menu-toggle-button');
            
            BUTTON.on(
                'click keyup', function ( e ) {

                    // prevent unintentional trigger with keyboard
                    if('keyup'===e.type) {
                        if(13!==e.which) {
                            return;
                        }
                    }
                
                    e.stopPropagation();
                
                    if (MOBILEMENU.hasClass(OPTIONS.collapsed) ) {
                        hideMenu();
                    } else {
                        showMenu();
                    }
                
                } 
            );
            
        };
        
        /**
         * Show mobile menu.
         */
        function showMenu() {

            MOBILEMENU.show();
            
            if(isSlide()){
                MOBILEMENU.find('#close-button').focus();
            }else{
                MOBILEMENU.slideDown();
            }

            BUTTON.removeClass(OPTIONS.toggleMenuShownClasses.hidden);
            BUTTON.addClass(OPTIONS.toggleMenuShownClasses.shown);
            
            MOBILEMENU.addClass(OPTIONS.collapsed);
            
        };
        
        /**
         * Hide mobile menu.
         */
        function hideMenu() {
            
            if(!isSlide()){
                MOBILEMENU.slideUp();
            }
            
            BUTTON.removeClass(OPTIONS.toggleMenuShownClasses.shown);
            BUTTON.addClass(OPTIONS.toggleMenuShownClasses.hidden);
            
            MOBILEMENU.removeClass(OPTIONS.collapsed);

            hideAllSubmenus(MOBILEMENU.find('ul'));

            MOBILEMENU.hide();
            
        };
        
        /**
         * Check to see if menu is sliding horizontally.
         */
        function isSlide() {
            
            if (OPTIONS.style === 'from-left' || OPTIONS.style === 'from-right' ) {
                return true;
            } else {
                return false;
            }
            
        };

        /**
         * Adds HTML markup for the close button to the mobile menu.
         */
        function addCloseButtton() {

            MOBILEMENU.prepend('<div id="close-button-wrap"><a id="close-button" class="fas fa-times" tabindex="0"></a></div>');
            MOBILEMENU.find('div #close-button').on(
                'click keyup',
                function(e){
                    // prevent unintentional trigger with keyboard
                    if('keyup'===e.type) {
                        if(13!==e.which) {
                            return;
                        }
                    }

                    e.stopPropagation();

                    hideMenu();

                    BUTTON.focus();
                }
            );

        }
        
        /**
         * Adds HTML markup for (submenu) drop down icons to the main menu.
         */
        function addSubmenuIcon() {

            FULLMENU.find(CLS_HAS_SUBMENU).each(function(){
                $(this).children('ul').before('<i class="' + OPTIONS.clsDropMenuIcon + ' fas '+ OPTIONS.toggleSubmenuClasses.hidden +'" tabindex="0"></i>');
            });

            FULLMENU_SUB_ICONS = FULLMENU.find(CLS_DROP_MENU_ICON);

        };

        /**
         * Hooks click event to the drop down icons in the main menu.
         */
        function submenuIconClick() {

            FULLMENU_SUB_ICONS.on(
                'click keyup',
                function(e){
                    // prevent unintentional trigger with keyboard
                    if('keyup'===e.type) {
                        if(13!==e.which && 27!==e.which) {
                            return;
                        }
                    }

                    e.stopPropagation();

                    // find submenu
                    var submenu = $(this).siblings('ul');

                    // show or hide
                    if(submenu.hasClass(OPTIONS.collapsed)) {
                        hideSubmenu(submenu);
                    } else {
                        if('keyup'===e.type) {
                            // Esc key on already closed submenu closes parent
                            if(27===e.which){
                                var parentUL = $(this).closest('ul');
                                
                                // if parent is submenu, close it
                                if(parentUL.parent(CLS_HAS_SUBMENU).length) {
                                    hideSubmenu(parentUL);
                                    parentUL.siblings(CLS_DROP_MENU_ICON).focus();
                                }
    
                                return;
                            }
                        }

                        submenu.slideDown().addClass(OPTIONS.collapsed);
                        $(this).removeClass(OPTIONS.toggleSubmenuClasses.hidden).addClass(OPTIONS.toggleSubmenuClasses.shown);
                    }
                }
            );

        }

        /**
         * Hides all submenus of a specific menu.
         * @param {jQueryObject} menu - The lement to search for submenus
         */
        function hideAllSubmenus(menu) {

            menu.find('ul').each(
                function(){
                    hideSubmenu( $(this) );
                }
            );

        }

        /**
         * Hide a specific menu item.
         * @param {jQueryObject} submenu - The submenu to hide.
         */
        function hideSubmenu(submenu) {

            submenu.slideUp().removeClass(OPTIONS.collapsed);

            var dropMenuIcon = submenu.siblings(CLS_DROP_MENU_ICON);

            if(dropMenuIcon.length) {
                dropMenuIcon.removeClass(OPTIONS.toggleSubmenuClasses.shown);
                dropMenuIcon.addClass(OPTIONS.toggleSubmenuClasses.hidden);
            }

        }

        init();
    };
    
})(jQuery);
