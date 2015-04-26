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