define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'views/BoatsTableView',
'text!templates/DashboardTemplate.html'
], function($, _, Parse, BaseView, BoatsTableView, DashboardTemplate){
	var DashboardView = BaseView.extend({

		className: "view-dashboard",
		
		template: _.template(DashboardTemplate),

		events : {
		},

		initialize: function() {
		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			var self = this;

			var collectionFetchSuccess = function(collection) {

				var boatsView = new BoatsTableView({ collection: collection });
				self.subViews.push(boatsView);
				self.$el.find('.boats').html(boatsView.render().el);

			};

			var collectionFetchError = function(error) {

				console.log(error);

			};

			Parse.User.current().get('host').relation('boats').query().collection().fetch().then(collectionFetchSuccess, collectionFetchError);

			return this;

		}

	});
	return DashboardView;
});
