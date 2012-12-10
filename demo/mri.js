/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
window.matchMedia = window.matchMedia || (function( doc, undefined ) {

  "use strict";

  var bool,
      docElem = doc.documentElement,
      refNode = docElem.firstElementChild || docElem.firstChild,
      // fakeBody required for <FF4 when executed in <head>
      fakeBody = doc.createElement( "body" ),
      div = doc.createElement( "div" );

  div.id = "mq-test-1";
  div.style.cssText = "position:absolute;top:-100em";
  fakeBody.style.background = "none";
  fakeBody.appendChild(div);

  return function(q){

    div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

    docElem.insertBefore( fakeBody, refNode );
    bool = div.offsetWidth === 42;
    docElem.removeChild( fakeBody );

    return {
      matches: bool,
      media: q
    };

  };

}( document ));

/*! matchMedia() polyfill addListener/removeListener extension. Author & copyright (c) 2012: Scott Jehl. Dual MIT/BSD license */
(function(){
	// monkeypatch unsupported addListener/removeListener with polling
	if( !window.matchMedia( "" ).addListener ){
		var oldMM = window.matchMedia;
		
		window.matchMedia = function( q ){
			var ret = oldMM( q ),
				listeners = [],
				last = false,
				timer,
				check = function(){
					var list = oldMM( q );
					if( list.matches && !last ){
						for( var i =0, il = listeners.length; i< il; i++ ){
							listeners[ i ].call( ret, list );
						}
					}
					last = list.matches;
				};
			
			ret.addListener = function( cb ){
				listeners.push( cb );
				if( !timer ){
					timer = setInterval( check, 1000 );
				}
			};

			ret.removeListener = function( cb ){
				for( var i =0, il = listeners.length; i< il; i++ ){
					if( listeners[ i ] === cb ){
						listeners.splice( i, 1 );
					}
				}
				if( !listeners.length && timer ){
					clearInterval( timer );
				}
			};
			
			return ret;
		};
	}
}());

/**
 * Magento responsive images
 * 
 * @category    Inchoo
 * @package     Inchoo_Theme
 * @author      Casablanca Team @ Inchoo <web@inchoo.net>
 */
var Inchoo = Inchoo || {};
Inchoo.Mri = Class.create({
	
	initialize: function(elements, rules, options) {
		
		if(!elements.length) {
			return;
		}
		
		this.elements = elements.findAll(function(e){ return (typeof(e.mri)=='undefined'); });
		this.rules = rules;
		this.options = Object.extend({
			appear		: true,
			onResize	: true,
			breakOnFirst: true,
			noMatch		: 'default'
		}, options || {});
		
		this.elements.each(function(img) {
			img.mri = true;
			//img.placeholderSrc = img.src;
		});		
		
		if(!window.matchMedia || !matchMedia('only all').matches) {
			if(this.options.noMatch) this.changeImagesTo(this.options.noMatch);
			return;
		}
		
		this.currentMatch = false;
		this.handleChange();
		
		if(this.options.onResize) {
			Event.observe(window, 'resize', this.handleChange.bind(this));
			Event.observe(window, 'orientationchange', this.handleChange.bind(this));
		}
		
	},
	
	changeImagesTo: function(match) {
		var doAppear = this.options.appear;
		this.elements.each(function(img) {
			var newSrc = img.getAttribute('data-src-'+match);
			if(!newSrc || newSrc == img.getAttribute('src')) {
				return;
			}
			
			img.addClassName('mri-loading');
			//if(img.placeholderSrc && img.src!=img.placeholderSrc) img.src = img.placeholderSrc;
			var imgPreloader = new Image();
			imgPreloader.onload = function() {
				if(doAppear) img.setOpacity(0.4);
				img.src = newSrc;
				if(doAppear) img.appear({duration:0.4});
				img.removeClassName('mri-loading');
				delete imgPreloader;
				//delete this;
			}
			imgPreloader.src = newSrc;		
		});			
	},
	
	handleChange: function() {
	
		var newMatch = false;
		for(key in this.rules) {
			if(matchMedia(this.rules[key]).matches) {
				newMatch = key;
				if(this.options.breakOnFirst) break;
			}
		}
		
		if(!newMatch || newMatch==this.currentMatch) {
			return;
		} else {
			this.currentMatch = newMatch;
		}
		
		this.changeImagesTo(newMatch);
	}

});

