define([
'models/CaptainRequestModel',
'models/BoatModel',
'models/BoatDayModel',
'views/BaseView',
'views/BoatsTableView',
'views/BoatDaysTableView',
'text!templates/DashboardTemplate.html',
'text!templates/DashboardCaptainRequestRowTemplate.html',
'text!templates/DashboardBoatRowTemplate.html',
], function(CaptainRequestModel, BoatModel, BoatDayModel, BaseView, BoatsTableView, BoatDaysTableView, DashboardTemplate, DashboardCaptainRequestRowTemplate, DashboardBoatRowTemplate){
	var DashboardView = BaseView.extend({

		className: "view-dashboard",
		
		template: _.template(DashboardTemplate),
		
		events: {
			'click .captainRequest': 'processCaptainRequest'
		},
		
		captainRequests: {},

		theme: "dashboard",

		processCaptainRequest: function(event) {

			var self = this;
			var e = $(event.currentTarget);
			this.captainRequests[e.attr('data-id')].save({ 
				status: e.is('.accept') ? 'approved' : 'denied' 
			}).then(function() {
				self.render();
			});
			
		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			var self = this;

			self.$el.find('.navbar-brand').text('Host Center');

			self.$el.find('.add-boat, .add-boatday, .my-boats, .my-requests').hide();

			var boatsFetchSuccess = function(boats) {

				if(boats.length == 0) {
					self.$el.find('.add-boat').fadeIn();
					return;
				}

				var tpl = _.template(DashboardBoatRowTemplate);
				var target = self.$el.find('.my-boats .content');
				target.html('');

				_.each(boats, function(boat) {
					boat.relation('boatPictures').query().first().then(function(fileholder) {
						target.append(tpl({
							id: boat.id,
							name: boat.get('name'),
							buildYear: boat.get('buildYear'),
							type: boat.get('type'),
							status: boat.get('status'),
							picture: typeof fileholder !== "undefined" ? fileholder.get('file').url() : 'resources/boat-placeholder.png'
						}));

						if(_.last(boats) == boat) {
							self.$el.find('.my-boats').fadeIn();
						}
					}, queryFindError);
				});

				var queryBoats = new Parse.Query(BoatDayModel);
				queryBoats.equalTo("host", Parse.User.current().get("host"));
				queryBoats.descending("name");
				queryBoats.find().then(boatdaysFetchSuccess, queryFindError);

			};

			var boatdaysFetchSuccess = function(boatdays) {

				if(boatdays.length == 0) {
					self.$el.find('.add-boatday').fadeIn();
					return;
				}

			};	

			var captainRequestsFetchSuccess = function(requests) {

				if(requests.length == 0) {
					return;
				}
				
 				var tpl = _.template(DashboardCaptainRequestRowTemplate);
				var target = self.$el.find('.my-requests .content');
				target.html('');

				_.each(requests, function(request) {
					target.append(tpl({
						id: request.id,
						displayName: request.get('fromProfile').get('displayName'),
						profilePicture: request.get('fromProfile').get('profilePicture').url(),
						boatName: request.get('boat').get('name'),
						boatType: request.get('boat').get('type')
					}));

					self.captainRequests[request.id] = request;

					if(_.last(requests) == request) {
						self.$el.find('.my-requests').fadeIn();
					}
 				});

			};

			var queryFindError = function(error) {
				console.log(error);
			};

			var queryBoats = new Parse.Query(BoatModel);
			queryBoats.equalTo("host", Parse.User.current().get("host"));
			queryBoats.descending("name");
			queryBoats.select("name", "buildYear", "type", "status"); 
			queryBoats.find().then(boatsFetchSuccess, queryFindError);

			var queryCaptainRequests = new Parse.Query(CaptainRequestModel);
			queryCaptainRequests.ascending('createdAt');
			queryCaptainRequests.equalTo('email', Parse.User.current().getEmail());
			queryCaptainRequests.include('boat');
			queryCaptainRequests.include('fromProfile');
			queryCaptainRequests.find().then(captainRequestsFetchSuccess);

			return this;

		},

		displayCaptainRequests: function() {
			
			var self = this;

			
		}

	});
	return DashboardView;
});
