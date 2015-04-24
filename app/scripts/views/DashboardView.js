define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'views/BoatsTableView',
'views/BoatdaysTableView',
'text!templates/DashboardTemplate.html'
], function($, _, Parse, BaseView, BoatsTableView, BoatdaysTableView, DashboardTemplate){
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

			var boatsFetchSuccess = function(collection) {

				var boatsView = new BoatsTableView({ collection: collection });
				self.subViews.push(boatsView);
				self.$el.find('.boats').html(boatsView.render().el);

			};

			var boatdaysFetchSuccess = function(collection) {

				var boatdaysView = new BoatdaysTableView({ collection: collection });
				self.subViews.push(boatdaysView);
				self.$el.find('.boatdays').html(boatdaysView.render().el);

			};	

			var collectionFetchError = function(error) {

				console.log(error);

			};

			Parse.User.current().get('host').relation('boats').query().collection().fetch({

				success : function(collection) {

				    boatsFetchSuccess(collection);
				    Parse.User.current().get('host').relation('boatdays').query().collection().fetch().then(boatdaysFetchSuccess, collectionFetchError);

			  	},

			  	error : function() {

			    	collectionFetchError();

			  	}
			  
			});

			return this;

		}

	});
	return DashboardView;
});
