define([
'models/CaptainRequestModel',
'models/BoatModel',
'models/BoatDayModel',
'views/BaseView',
'text!templates/DashboardTemplate.html',
'text!templates/DashboardCaptainRequestRowTemplate.html',
'text!templates/DashboardBoatRowTemplate.html',
'text!templates/DashboardBoatDayTemplate.html',
], function(CaptainRequestModel, BoatModel, BoatDayModel, BaseView, DashboardTemplate, DashboardCaptainRequestRowTemplate, DashboardBoatRowTemplate, DashboardBoatDayTemplate){
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

			//self.$el.find('.navbar-brand').text('Host Center');
			self.$el.find('.left-navigation .menu-host-center').addClass('active');

			self.$el.find('.add-boat, .add-boatday, .my-boatdays, .my-boats, .my-requests').hide();

			var boatsFetchSuccess = function(boats) {

				if(boats.length == 0) {
					self.$el.find('.add-boat').fadeIn();
					return;
				}

				var tpl = _.template(DashboardBoatRowTemplate);
				var target = self.$el.find('.my-boats .content .rows');
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

				var queryBoatDays = new Parse.Query(BoatDayModel);
				queryBoatDays.equalTo("host", Parse.User.current().get("host"));
				queryBoatDays.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
				queryBoatDays.ascending('date,departureTime');
				queryBoatDays.include('boat');
				queryBoatDays.find().then(boatdaysFetchSuccess, queryFindError);

			};

			var boatdaysFetchSuccess = function(boatdays) {

				if(boatdays.length == 0) {
					self.$el.find('.add-boatday').fadeIn();
					return;
				}

				var tpl = _.template(DashboardBoatDayTemplate);
				var target = self.$el.find('.my-boatdays .content .items');
				target.html('');

				var left = false;
				_.each(boatdays, function(boatday) {
					boatday.get('boat').relation('boatPictures').query().first().then(function(fileholder) {
						left = !left;
						target.append(tpl({
							_class: left ? 'left' : 'right',
							id: boatday.id,
							status: boatday.get('status'),
							date: self.dateParseToDisplayDate(boatday.get('date')),
							time: self.departureTimeToDisplayTime(boatday.get('departureTime')),
							duration: boatday.get('duration'),
							name: boatday.get('name'),
							availableSeats: boatday.get('availableSeats'),
							bookedSeats: 0,
							potEarings: boatday.get('price') * 0.85 * boatday.get('availableSeats'),
							boatName: boatday.get('boat').get('name'),
							boatType: boatday.get('boat').get('type'),
							picture: typeof fileholder !== "undefined" ? fileholder.get('file').url() : 'resources/boat-placeholder.png'
						}));

						if(_.last(boatdays) == boatday) {
							self.$el.find('.my-boatdays').fadeIn();
						}
					}, queryFindError);
				});
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
						status: request.get('status'),
						displayName: request.get('fromProfile').get('displayName'),
						profilePicture: request.get('fromProfile').get('profilePicture').url(),
						boatName: request.get('boat').get('name'),
						boatType: request.get('boat').get('type'),
						buildYear: request.get('boat').get('buildYear')
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
			queryBoats.ascending('name');
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
