define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/BoatdayTemplate.html'
], function($, _, Parse, BaseView, BoatdayTemplate){
	var BoatdayView = BaseView.extend({

		className:"view-event",

		template: _.template(BoatdayTemplate),

		events: {
			
			"submit form" : "save", 
			'change [name="cancellationPolicy"]' : "refreshInformation"
		}, 

		initialize: function() {

		},

		render: function() {

			BaseView.prototype.render.call(this);
			this.refreshInformation();

			var eventYear = this.model.get('eventDate') ? this.model.get('eventDate').substring(6) : new Date().getFullYear();

			for(var i = eventYear; i < new Date().getFullYear() + 3; i++) {
				
				var opt = $('<option>').val(i).text(i);
				
				if( eventYear == i ) {
					opt.attr('selected', 1);
				}

				this.$el.find('[name="eventYear"]').append(opt);
			}
			
			return this;

		},

		refreshInformation: function() {
			var cancellationPolicy = this._in('cancellationPolicy').val();

			if( cancellationPolicy == "flexible" ) {
				this.$el.find('#flexible-info').show();
				this.$el.find('#moderate-info').hide();
				this.$el.find('#strict-info').hide();

			} else if( cancellationPolicy == "moderate") {
				this.$el.find('#moderate-info').show();
				this.$el.find('#flexible-info').hide();
				this.$el.find('#strict-info').hide();

			} else {
				this.$el.find('#strict-info').show();
				this.$el.find('#flexible-info').hide();
				this.$el.find('#moderate-info').hide();
			}

		},

		save: function() {

			event.preventDefault();
			var self = this;
			var baseStatus = this.model.get('status');

			var data = {

				status: 'complete',
				boatName: this._in('boatName').val(), 
				captain: this._in('captain').val(), 
				eventName: this._in('eventName').val(), 
				eventDate: this._in('eventMonth').val() + "/" + this._in('eventDay').val() + "/" + this._in('eventYear').val(),
				departureTime: this._in('departureHour').val() + ":" + this._in('departureMinute').val() + " " + this._in('period').val(), 
				duration: this._in('duration').val(), 
				pricePerSeat: this._in('price').val(), 
				availableSeats: this._in('availableSeats').val(), 
				minimumSeats: this._in('minimumSeats').val(), 
				departureLocation: this._in('departureLocation').val(), 
				eventDescription: this._in('eventDescription').val(),
				bookingPolicy: this._in('bookingPolicy').val(), 
				cancellationPolicy: this._in('cancellationPolicy').val()

			};

			var saveSuccess = function( boatday ) {
		
				if( baseStatus == 'creation' ) {

					var hostSaveSuccess = function() {
						Parse.history.navigate('boatday/'+boatday.id, true);
					};

					var hostSaveError = function(error) {
						console.log(error);
					}

					var host = Parse.User.current().get("host");
					host.relation('boatdays').add(boatday);
					host.save().then(hostSaveSuccess, hostSaveError);

				} else {
					
					Parse.history.navigate('dashboard', true);

				}

			};

			var saveError = function(error) {
				
				self._error(error);

			};
			
			this.model.save(data).then(saveSuccess, saveError);


		}
	});
	return BoatdayView;

});