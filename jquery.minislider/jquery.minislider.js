/*
jQuery Minislider

@version 1.0.0
@author Thapelo Moeti
*/
(function($){
	
	$.fn.minislider = function(options){
		return this.each(function(i,element){
			var _s = new MiniSlider(element,options);
		});
	}
	
	// start here
	var MiniSlider = function(el,opt){
		var q = this;
		
		q.init = function(){
			q.main = $(el);
			q.parent = q.main.parent();
			q.index = 0;
			q.len = q.main.children().length;
			
			q.settings = $.extend({ duration: 8000, transition_speed: 1000, ani_speed: 500, 
									dots: true, position_dots: true,
									wrapper_class: "minislider-wrapper", class: "slider",
									navigation: true, style_nav: true, position_nav: true,
									fixed_width: false, fixed_height: false,
									auto_slide: true, next: false, previous: false }, opt);
			
			
			// apply classes
			q.main.addClass(q.settings.class);
			q.parent.addClass(q.settings.wrapper_class);
			
			// responding to window resize
			if(!q.has_fixed_width()){
				$(window).resize(q.resize);	
			}
			q.resize();
			
			if(q.has_fixed_height()){
				q.set_fixed_height();
			}
			
			if(q.settings.dots){
				q.add_dots();

				if(q.settings.position_dots)
					q.position_dots();
			}else{
				q.settings.position_dots = false;
			}
			
			if(q.settings.navigation){
				q.add_navigation();
				
				if(q.settings.style_nav)
					q.style_nav();
				
				if(q.settings.position_nav)
					q.position_nav();					
			}else{
				q.settings.style_nav = q.settings.position_nav = false;
			}
			
			if(typeof(q.settings.next)=="string"){
				$(q.settings.next).click(q.next);
			}
			
			if(typeof(q.settings.previous)=="string"){
				$(q.settings.previous).click(q.previous);
			}
			
			if(q.settings.auto_slide && q.len > 1)
				q.TIMER = setInterval(q.next,q.settings.duration);
			
			q.resize();
		}
		
		q.has_fixed_width = function(){
			
			// first data-width attribute
			var w = q.main.attr('data-width');
			var type = typeof(w);
			if(type == "string" || type == "number"){
				if(!isNaN(w)){
					q.settings.fixed_width = parseInt(w);
					return true;				
				}				
			}
			
			// then check settings
			type = typeof(q.settings.fixed_width);
			
			if(type == "string" || type == "number"){
				if(!isNaN(parseInt(q.settings.fixed_width))){		
					q.settings.fixed_width = parseInt(q.settings.fixed_width);
					return true;
				}				
			}
			// if no valid widths return false;
			return false;
		}
		
		q.has_fixed_height = function(){
			
			// data-height attribute first
			var h = q.main.attr('data-height');	
			if(!isNaN(h)){
				q.settings.fixed_height = parseInt(h);
				return true;				
			}
			
			// then check settings
			
			if(!isNaN(parseInt(q.settings.fixed_height))){
				q.settings.fixed_height = parseInt(q.settings.fixed_height);
				return true;				
			}
			
			// check if true is passed, then set height to first slide's height
			if(typeof(q.settings.fixed_height) == "boolean" && q.settings.fixed_height === true){				
				q.settings.fixed_height = q.main.children().eq(0).height();
				return true;
			}
			
			// if no valid height found return false
			return false;			
		}
		
		/* Window Resize */
		q.resize = function(){
			var w = q.p_w();
			
			q.main.width(w * q.len).children().width(w);
			
			if(q.has_fixed_width())
				q.parent.width(w);
			
			q.goto(q.index); // place current slide correctly
		}
		
		q.set_fixed_height = function(){
			q.main.css({ height: q.settings.fixed_height + 'px', overflow: 'hidden'});
		}
		
		/* Current Height */
		q.c_h = function(){
			// if has fixed height return that
			if(q.has_fixed_height()){
				return q.settings.fixed_height;
			}
			
			return Math.floor(q.main.children().eq(q.index).outerHeight());
		}
		
		/* Parent Width */
		q.p_w = function(){
			// if has fixed width return that
			if(q.has_fixed_width()){
				return q.settings.fixed_width;				
			}
			
			return Math.floor(q.parent.outerWidth());
		}
		
		/* Next */
		q.next = function(){
			
			clearInterval(q.TIMER);
			
			var i = q.index+1;
			
			if(i >= q.len){
				i = 0;
			}
			
			q.goto(i);
			
			if(q.settings.auto_slide)
				q.TIMER = setInterval(q.next,q.settings.duration);		
		}
		
		/* Previous */
		q.previous = function(){
			
			clearInterval(q.TIMER);
			
			var i = q.index - 1;
			
			if(i < 0){
				i = q.len - 1;
			}
			
			var w = q.p_w();
			var m = w * i * -1;
			
			q.goto(i);
			
			if(q.settings.auto_slide)
				q.TIMER = setInterval(q.next,q.settings.duration);			
		}
		
		/* Go-To */
		q.goto = function(i){
			q.index = i;
			var w = q.p_w();
			var m = w * i * -1;
			
			q.main.stop().animate({marginLeft: m + "px"});
			
			if(q.settings.dots){
				q.parent.find('.dots li').removeClass('active').eq(q.index).addClass('active');
				
				if(q.settings.position_dots)
					q.position_dots();
			}
			
			if(q.settings.position_nav)
				q.position_nav();
		}
		
		q.add_dots = function(){
			var txt = '<ul class="dots">';
			
			for(x = 0; x < q.len; x++){
				txt += '<li></li>';
			}
			
			txt += '</ul>';
			
			q.parent.prepend(txt).children('.dots').css({ position: 'absolute', zIndex: 5 }).children().eq(0).addClass('active');
			q.add_click();
		}
		
		q.add_click = function(){
			q.parent.children('.dots').children().each(function(i, e){
				$(e).click(function(){
					q.goto(i);					
				});
			});
		}
		
		q.position_dots = function(){
			var dots = q.parent.find('.dots');			
			
			var c_h = q.c_h(); // current slide height
			var c_w = q.p_w(); // current width
			
			var d_w = dots.width(); // dots width
			
			// new offset for dots
			var d_o = { left: Math.floor((c_w / 2) - (d_w / 2)), top : Math.floor(c_h - 40) };
			
			dots.animate({top: d_o.top + 'px', left: d_o.left + 'px' }, q.settings.ani_speed);
		}
		
		q.add_navigation = function(){
			var txt = '<ul class="navigation"><li class="previous">&lt;</li><li class="next">&gt;</li></ul>';
			
			q.parent.prepend(txt).children('.navigation').eq(0).children('.previous').click(function(){
				q.previous();
			}).parent().children('.next').click(function(){
				q.next();
			});
		}
		
		q.style_nav = function(){
			// q.parent.children('.navigation').eq(0).children().css({position: 'absolute'}).width(30).height(30);
		}
		
		q.position_nav = function(){
			var nav = q.parent.children('.navigation').eq(0);
			nav.animate({ top: ((q.c_h() / 2) - (nav.outerHeight() / 2)) + "px"}, q.settings.ani_speed);
		}
		
		q.init();
	};
	
}(jQuery));