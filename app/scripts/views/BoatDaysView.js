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
			// queryBoatDays.equalTo("host", Parse.User.current().get("host"));
			queryBoatDays.descending('date,departureTime');
			queryBoatDays.include('boat');

			queryBoatDays.find().then(function(boatdays) {
				
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
						picture: 'resources/boat-placeholder.png',
						active: new Date(_bDa.getFullYear(), _bDa.getMonth(), _bDa.getDate(), Math.floor(_bDt), (_bDt-Math.floor(_bDt))*60) >= new Date()
					});

					target.append(_tpl);

					boatday.get('boat').relation('boatPictures').query().first().then(function(fileholder) {
						
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
