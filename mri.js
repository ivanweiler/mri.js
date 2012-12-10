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
