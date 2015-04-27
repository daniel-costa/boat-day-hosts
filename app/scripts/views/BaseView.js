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

			this._in(name).closest('.form-group').addClass("has-error has-feedback").find('.form-control-feedback').show();
			if(message) 
				this._in(name).attr('title', message).attr('data-toggle', 'tooltip').tooltip();

		},

		cleanForm: function() {

			this.$el.find('.form-control-feedback').hide();
			this.$el.find('.has-error').removeClass('has-error').removeClass('has-feedback');
			this.$el.find('[data-toggle="tooltip"]').tooltip('destroy');

		},

		buttonLoader: function( text, button ) {

			if( !button ) {
			
				var button = this.$el.find('[type="submit"]');

			}

			if( !text ) {

				button.removeAttr('disabled').text(button.attr('txt')).removeAttr('txt');

			} else {

				button.attr('disabled', 1);
				button.attr('txt', button.text());
				button.text(button.text() + ' (' + text + ')');

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