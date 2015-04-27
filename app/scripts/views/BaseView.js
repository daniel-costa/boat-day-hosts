define([
'parse'
], function(Parse){
	var BaseView = Parse.View.extend({

		className: "view-base",

		subViews: [],

		debug: true,

		render: function() {
			console.log("### Render by BaseView (" + this.className + ") ###");

			if(this.model) {	
				this.$el.html(this.template(this.model.toJSON()));
			} else if(this.collection) {
				console.log({ collection: this.collection.toJSON() });
				this.$el.html(this.template({ collection: this.collection.toJSON() }));
			} else {
				this.$el.html(this.template());
			}

			return this;
		},

		afterRender: function() {

			if( this.debug ) {
				this.debugAutofillFields();
			}
			
		},

		fieldError: function(name, message) {

			var field = this._in(name);

			field.closest('.form-group').addClass("has-error has-feedback");

			$('<span>').addClass('glyphicon glyphicon-remove form-control-feedback field-error-auto').insertAfter(field);
			
			if(message) {

				var show = function() { $(this).popover('show'); };
				var hide = function() { $(this).popover('hide'); };

				var params = { 
					container: 'body',
					content: message,
					trigger: 'manual'
				};

				if( field.hasClass('field-error-flag') ) {

					field.data('bs.popover').options.content = message;

				} else {

					field.addClass('field-error-flag').popover(params);	

				}

				field.focus(show).blur(hide).hover(show, hide)
			}

		},

		cleanForm: function() {

			this.$el.find('.field-error-auto').remove();
			this.$el.find('.has-error').removeClass('has-error has-feedback');
			this.$el.find('.field-error-flag').popover('hide').unbind('focus').unbind('blur').unbind('hover');

		},

		buttonLoader: function( text, button ) {

			if( !button ) {
			
				var button = this.$el.find('[type="submit"]');

			}

			if( text ) {

				button.attr('data-loading-text', text).button('loading');

			} else {

				button.button('reset');

			}
		},

		debugAutofillFields: function() { },

		teardown: function() {
			if(this.model) {
				this.model.off(null, null, this);
			}
			this.remove();
		},
		
		_in: function(name) {
			
			return this.$el.find('[name="' + name + '"]');

		},

		_error: function(message) {

			$(document).trigger('globalError', message);

		},

		_info: function(message) {

			$(document).trigger('globalInfo', message);

		}
	});
	return BaseView;
});