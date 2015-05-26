define([
'models/CaptainRequestModel',
'views/BaseView',
'views/BoatsTableView',
'views/BoatDaysTableView',
'text!templates/DashboardTemplate.html',
'text!templates/DashboardCaptainRequestRowTemplate.html',
], function(CaptainRequestModel, BaseView, BoatsTableView, BoatDaysTableView, DashboardTemplate, DashboardCaptainRequestRowTemplate){
	var DashboardView = BaseView.extend({

		className: "view-dashboard",
		
		template: _.template(DashboardTemplate),
		
		events: {
			'click .captainRequest': 'processCaptainRequest'
		},

		collectionBoats: null,

		collectionBoatDays: null,
		
		theme: "dashboard",

		processCaptainRequest: function(event) {

			var self = this;
			var e = $(event.currentTarget);
			var request = this.captainRequests[e.attr('data-id')];
			
			var saveDone = function() {

				self.displayCaptainRequests();

			};

			if(e.is('.accept')) {
				request.save({ status: 'approved' }).then(saveDone);
			} else {
				request.save({ status: 'denied' }).then(saveDone);
			}
			
		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			var self = this;

			var boatsFetchSuccess = function(collection) {

				if(collection.length == 0) {

					self.$el.find('a.create-boatday').click(function(event) {

						event.preventDefault();

						var cb = function() {
							Parse.history.navigate('boat/new', true);
						}

						self.modal({
							title: 'No boats yet',
							body: 'Before you can add a BoatDay, you have to add a boat to your blabla.',
							noButton: false,
							cancelButtonText: 'Later',
							yesButtonText: 'Add Boat',
							yesCb: cb
						});

					});
				}

				self.collectionBoats = collection;
				var boatsView = new BoatsTableView({ collection: self.collectionBoats });
				self.subViews.push(boatsView);
				self.$el.find('.boats').html(boatsView.render().el);

			};

			var boatdaysFetchSuccess = function(collection) {

				self.collectionBoatDays = collection;
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

			this.displayCaptainRequests();

			return this;

		},

		displayCaptainRequests: function() {
			
			var self = this;

			var captainRequestsFetchSuccess = function(requests) {

				self.$el.find('.captainRequestsHolder').html('');
				
				if(requests.length == 0)
					return;

				var data = { data: [] };

				_.each(requests, function(request) {

					self.captainRequests[request.id] = request;

 					data.data.push({
 						id: request.id,
						displayName: request.get('fromProfile').get('displayName'),
						profilePicture: request.get('fromProfile').get('profilePicture').url(),
						boatName: request.get('boat').get('name'),
						boatType: request.get('boat').get('type')
 					});
 				});

 				var tpl = _.template(DashboardCaptainRequestRowTemplate);

				self.$el.find('.captainRequestsHolder').html(tpl(data));

			};

			var queryCaptainRequests = new Parse.Query(CaptainRequestModel);
			queryCaptainRequests.ascending('createdAt');
			queryCaptainRequests.equalTo('email', Parse.User.current().getEmail());
			queryCaptainRequests.equalTo('status', 'pending');
			queryCaptainRequests.include('boat');
			queryCaptainRequests.include('fromProfile');
			queryCaptainRequests.find().then(captainRequestsFetchSuccess);
		}

	});
	return DashboardView;
});
