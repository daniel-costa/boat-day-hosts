define([
'jquery', 
'underscore', 
'parse', 
'text!templates/SignOut.html'
], function($, _, Parse, SignOutTemplate){
	var SignOutView = Parse.View.extend({
		template: _.template(SignOutTemplate),

		events:{

		},
		initialize: function(){
			this.render();
		},
		render: function(){
			this.$el.html(this.template());
		}

	});
	return SignOutView;
});