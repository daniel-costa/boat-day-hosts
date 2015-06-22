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
			'click .captainRequest': 'processCaptainRequest',
			'click .boatday-box-close': 'closeBox',
			'click .boatday-box-open': 'openBox',
			'click .btn-cancel': 'cancelBoatDay',
			'click .btn-cancel-confirm': 'confirmCancellation'
		},
		
		captainRequests: {},

		boatdays: {},

		theme: "dashboard",

		cancelBoatDay: function(event) {
			$(event.currentTarget).closest('.info').find('.details').hide();
			$(event.currentTarget).closest('.info').find('.cancel').show();
		},

		confirmCancellation: function(event) {
			var self = this;
			var id = $(event.currentTarget).closest('.my-boatday').attr('data-id');
			var boatday = self.boatdays[id];

			if(self._in('cancelReason').val() == '') {
				self.fieldError('cancelReason', 'Please indicate a reason');
				return;
			}

			boatday.save({status: 'cancel', cancelReason: self._in('cancelReason').val() }).then(function() {
				self.render();
				self._info('Your BoatDay ' + boatday.get('name') + ' is now cancelled.');
			});
		},

		openBox: function(event) {
			$(event.currentTarget).closest('.my-boatday').find('.boatday-share').hide();
			$(event.currentTarget).closest('.my-boatday').find($(event.currentTarget).attr('data-target')).fadeIn();
		},

		closeBox: function(event) {
			$(event.currentTarget).closest('.my-boatday').find('.boatday-share').show();
			$(event.currentTarget).closest('.box').fadeOut();
		},

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
			self.$el.find('.left-navigation .menu-host-center').text('Host Center');
			self.$el.find('.add-boat, .add-boatday, .my-boatdays, .my-boats, .my-requests').hide();

			var boatsFetchSuccess = function(boats) {

				if(boats.length == 0) {
					self.$el.find('.add-boat').fadeIn();
					return;
				}

				self.$el.find('.menu-new-boatday').show();

				var tpl = _.template(DashboardBoatRowTemplate);
				var target = self.$el.find('.my-boats .content .rows');
				target.html('');

				_.each(boats, function(boat) {

					var _tpl = tpl({
						id: boat.id,
						name: boat.get('name'),
						buildYear: boat.get('buildYear'),
						type: boat.get('type'),
						status: boat.get('status'),
						picture: 'resources/boat-placeholder.png'
					});

					target.append(_tpl);
					
					boat.relation('boatPictures').query().first().then(function(fileholder) {

						if( fileholder ) {
							self.$el.find('.my-boats .my-boat-'+boat.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
						}

					});
				});

				self.$el.find('.my-boats').fadeIn();

				var queryBoatDays = new Parse.Query(BoatDayModel);
				queryBoatDays.equalTo("host", Parse.User.current().get("host"));
				queryBoatDays.equalTo("status", "complete");
				queryBoatDays.greaterThanOrEqualTo("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
				queryBoatDays.ascending('date,departureTime');
				queryBoatDays.include('boat');
				queryBoatDays.include('captain');
				queryBoatDays.find().then(boatdaysFetchSuccess);

			};

			var boatdaysFetchSuccess = function(boatdays) {

				if(boatdays.length == 0) {
					self.$el.find('.add-boatday').fadeIn();
					return;
				}

				self.$el.find('.menu-my-boatdays').show();

				var tpl = _.template(DashboardBoatDayTemplate);
				var target = self.$el.find('.my-boatdays .content .items');
				target.html('');

				var left = false;

				_.each(boatdays, function(boatday) {
					
					left = !left;

					var _tpl = tpl({
						_class: left ? 'left' : 'right',
						id: boatday.id,
						status: boatday.get('status'),
						date: self.dateParseToDisplayDate(boatday.get('date')),
						time: self.departureTimeToDisplayTime(boatday.get('departureTime')),
						duration: boatday.get('duration'),
						name: boatday.get('name'),
						availableSeats: boatday.get('availableSeats'),
						bookedSeats: 0,
						potEarings: boatday.get('price') * 0.75 * boatday.get('availableSeats'),
						boatName: boatday.get('boat').get('name'),
						boatType: boatday.get('boat').get('type'),
						boatYear: boatday.get('boat').get('buildYear'),
						captainName: boatday.get('captain').get('displayName'),
						picture: 'resources/boat-placeholder.png',
						description: boatday.get('description'),
						price: boatday.get('price'),
						activity: self.boatdayActivityToDisplay(boatday.get('category')),
						booking: self.boatdayBookingToDisplay(boatday.get('bookingPolicy')),
						cancellation: self.boatdayCancellationToDisplay(boatday.get('cancellationPolicy')),
						location: boatday.get('locationText'),
						active: true
					});

					self.boatdays[boatday.id] = boatday;
					target.append(_tpl);

					boatday.get('boat').relation('boatPictures').query().first().then(function(fileholder) {
						
						if( fileholder ) {
							self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
						}

					});

				});
	
				FB.XFBML.parse($(this.$el).find('.social')[0]);
				twttr.widgets.load($(this.$el).find('.social')[0]);
				gapi.plusone.render($(this.$el).find('.social')[0]);
				gapi.plus.go();

				self.$el.find('.my-boatdays').fadeIn();
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
 				});
				
				self.$el.find('.my-requests').fadeIn();

			};

			var queryBoats = new Parse.Query(BoatModel);
			queryBoats.equalTo("host", Parse.User.current().get("host"));
			queryBoats.ascending('name');
			queryBoats.select("name", "buildYear", "type", "status"); 
			queryBoats.find().then(boatsFetchSuccess);

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
