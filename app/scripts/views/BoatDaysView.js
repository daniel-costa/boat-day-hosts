define([
'models/BoatDayModel',
'views/BaseView',
'text!templates/BoatDaysTemplate.html',
'text!templates/DashboardBoatDayTemplate.html'
], function(BoatDayModel, BaseView, BoatDaysTemplate, DashboardBoatDayTemplate){
	var BoatDaysView = BaseView.extend({

		className: "view-my-boatdays",
		
		template: _.template(BoatDaysTemplate),
		
		events: {
			'click .boatday-box-close': 'closeBox',
			'click .boatday-box-open': 'openBox'
		},

		captainRequests: {},

		theme: "dashboard",

		openBox: function(event) {
			$(event.currentTarget).closest('.my-boatday').find('.boatday-share').hide();
			$(event.currentTarget).closest('.my-boatday').find($(event.currentTarget).attr('data-target')).fadeIn();
		},

		closeBox: function(event) {
			$(event.currentTarget).closest('.my-boatday').find('.boatday-share').show();
			$(event.currentTarget).closest('.box').fadeOut();
		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			var self = this;

			self.$el.find('.left-navigation .menu-my-boatdays').addClass('active');
			self.$el.find('.left-navigation a.link').hide();
			self.$el.find('.left-navigation a.menu-my-boatdays').show().css('display', "block");

			self.$el.find('.add-boatday, .my-boatdays').hide();

			var queryBoatDaysComplete = new Parse.Query(BoatDayModel);
			queryBoatDaysComplete.equalTo("status", 'complete');
			queryBoatDaysComplete.lessThan("date", new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));

			var queryBoatDaysOthers = new Parse.Query(BoatDayModel);
			queryBoatDaysOthers.notEqualTo("status", 'complete');
			

			var mainQuery = Parse.Query.or(queryBoatDaysComplete, queryBoatDaysOthers);
			mainQuery.equalTo("host", Parse.User.current().get("host"));
			mainQuery.descending('date,departureTime');
			mainQuery.include('boat');
			mainQuery.include('captain');
			mainQuery.find().then(function(boatdays) {
				
				if(boatdays.length == 0) {
					self.$el.find('.add-boatday').fadeIn();
					return;
				}

				var tpl = _.template(DashboardBoatDayTemplate);
				var target = self.$el.find('.my-boatdays .content .items');
				target.html('');

				var left = false;

				_.each(boatdays, function(boatday) {
					
					left = !left;
					var _bDa = boatday.get('date');
					var _bDt = boatday.get('departureTime');

					var _tpl = tpl({
						_class: left ? 'left' : 'right',
						id: boatday.id,
						status: boatday.get('status'),
						date: self.dateParseToDisplayDate(_bDa),
						time: self.departureTimeToDisplayTime(_bDt),
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
						location: "Miami Beach",
						active: false
					});

					target.append(_tpl);

					var q = boatday.get('boat').relation('boatPictures').query();
					q.ascending('order');
					q.first().then(function(fileholder) {
						
						if( fileholder ) {
							console.log(self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .picture'));
							self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
						}

					});

				});

				self.$el.find('.my-boatdays').fadeIn();

			});

			return this;

		}

	});
	return BoatDaysView;
});
