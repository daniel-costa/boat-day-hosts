define([
'models/CaptainRequestModel',
'views/BaseView',
'views/BoatsTableView',
'views/BoatDaysTableView',
'views/CaptainRequestsTableView',
'text!templates/DashboardTemplate.html'
], function(CaptainRequestModel, BaseView, BoatsTableView, BoatDaysTableView, CaptainRequestsTableView, DashboardTemplate){
	var DashboardView = BaseView.extend({

		className: "view-dashboard",
		
		template: _.template(DashboardTemplate),
		
		render: function() {

			BaseView.prototype.render.call(this);
			
			var self = this;
			
			var captainRequestsFetchSuccess = function(collection) {

				var captainRequestsView = new CaptainRequestsTableView({ data: collection });
				self.subViews.push(captainRequestsView);
				self.$el.find('.captainRequests').html(captainRequestsView.render().el);

			};

			var boatsFetchSuccess = function(collection) {

				var boatsView = new BoatsTableView({ collection: collection });
				self.subViews.push(boatsView);
				self.$el.find('.boats').html(boatsView.render().el);

			};

			var boatdaysFetchSuccess = function(collection) {

				var BoatDaysView = new BoatDaysTableView({ collection: collection });
				self.subViews.push(BoatDaysView);
				self.$el.find('.boatdays').html(BoatDaysView.render().el);

			};	

			var collectionFetchError = function(error) {

				console.log(error);

			};

			var queryBoats = Parse.User.current().get('host').relation('boats').query();
			queryBoats.descending('name');
			queryBoats.collection().fetch().then(boatsFetchSuccess, collectionFetchError);

			var queryBoatDays = Parse.User.current().get('host').relation('boatdays').query();
			queryBoatDays.ascending('date,departureTime');
			queryBoatDays.collection().fetch().then(boatdaysFetchSuccess, collectionFetchError);

			var queryCaptainRequests = new Parse.Query(CaptainRequestModel);
			queryCaptainRequests.ascending('createdAt');
			queryCaptainRequests.equalTo('email', Parse.User.current().getEmail());
			queryCaptainRequests.equalTo('status', 'pending');
			queryCaptainRequests.include('boat');
			queryCaptainRequests.include('fromProfile');
			queryCaptainRequests.collection().fetch().then(captainRequestsFetchSuccess, collectionFetchError);

			return this;

		}

	});
	return DashboardView;
});
