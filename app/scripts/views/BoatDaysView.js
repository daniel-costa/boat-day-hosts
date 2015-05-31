define([
'models/BoatDayModel',
'views/BaseView',
'text!templates/BoatDaysTemplate.html',
'text!templates/DashboardBoatDayTemplate.html'
], function(BoatDayModel, BaseView, BoatDaysTemplate, DashboardBoatDayTemplate){
	var BoatDaysView = BaseView.extend({

		className: "view-my-boatdays",
		
		template: _.template(BoatDaysTemplate),
		
		
		captainRequests: {},

		theme: "dashboard",

		render: function() {

			BaseView.prototype.render.call(this);
			
			var self = this;

			self.$el.find('.left-navigation .menu-my-boatdays').addClass('active');

			self.$el.find('.add-boatday, .my-boatdays').hide();

			var queryBoatDays = new Parse.Query(BoatDayModel);
			queryBoatDays.equalTo("host", Parse.User.current().get("host"));
			queryBoatDays.descending('createdAt');
			queryBoatDays.include('boat');
			queryBoatDays.find().then(boatdaysFetchSuccess, function(error) {
				console.log('error');
			});

			console.log(Parse.User.current().get("host"))
			console.log(queryBoatDays)

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
							potEarings: boatday.get('price') * 0.75 * boatday.get('availableSeats'),
							boatName: boatday.get('boat').get('name'),
							boatType: boatday.get('boat').get('type'),
							picture: typeof fileholder !== "undefined" ? fileholder.get('file').url() : 'resources/boat-placeholder.png'
						}));

						if(_.last(boatdays) == boatday) {
							self.$el.find('.my-boatdays').fadeIn();
						}
					});
				});
			};


			console.log("queryBoatDays");

			return this;

		}

	});
	return BoatDaysView;
});
