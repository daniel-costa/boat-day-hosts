define([
'parse'
], function(Parse){
	var BaseView = Parse.View.extend({

		subViews: {},

		render: function() {
			console.log("### Render by BaseView ###");
			// console.log(this.el);

			if(this.model) {	
				this.$el.html(this.template(this.model.toJSON()));
			} else {
				this.$el.html(this.template());
			}
			return this;
		},

		teardown: function() {
			console.log("** clean view **");
			if(this.model) {
				this.model.off(null, null, this);
			}
			this.remove();
			console.log("** clean view end**");
		},
		
		_in: function(name) {
			return this.$el.find('[name="' + name + '"]');
		},

	});
	return BaseView;
});