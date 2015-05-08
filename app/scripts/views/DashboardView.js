define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'views/BoatsTableView',
'views/BoatDaysTableView',
'text!templates/DashboardTemplate.html'
], function($, _, Parse, BaseView, BoatsTableView, BoatDaysTableView, DashboardTemplate){
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

			this.$el.find('.area').hide();

			if( Parse.User.current().get('host') ) {

				this.renderHost();
				this.$el.find('.area-host').show();
				
			}

			if( Parse.User.current().get('driver') ) {

				this.renderDriver();
				this.$el.find('.area-driver').show();
				
			}

			return this;

		},

		renderHost: function() {

			var self = this;
			
			var boatsFetchSuccess = function(collection) {

				var boatsView = new BoatsTableView({ collection: collection });
				self.subViews.push(boatsView);
				self.$el.find('.boats').html(boatsView.render().el);

			};

			var boatDaysFetchSuccess = function(collection) {

				var boatDaysView = new BoatDaysTableView({ collection: collection });
				self.subViews.push(boatDaysView);
				self.$el.find('.boatDays').html(boatDaysView.render().el);

			};	

			var collectionFetchError = function(error) {

				console.log(error);

			};

			Parse.User.current().get('host').relation('boats').query().collection().fetch().then(boatsFetchSuccess, collectionFetchError);
			Parse.User.current().get('host').relation('boatDays').query().collection().fetch().then(boatDaysFetchSuccess, collectionFetchError);

		},

		renderDriver: function() {

		}

	});
	return DashboardView;
});
