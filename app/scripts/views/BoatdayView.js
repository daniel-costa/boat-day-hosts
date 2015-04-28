define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'views/BoatsSelectView',
'text!templates/BoatdayTemplate.html'
], function($, _, Parse, BaseView, BoatsSelectView, BoatdayTemplate){
	var BoatdayView = BaseView.extend({

		className:"view-event",

		template: _.template(BoatdayTemplate),

		debug: true,

		events: {
			
			"submit form" : "save"
		}, 

		initialize: function() {

		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			var boatsFetchSuccess = function(collection) {

				var boatsView = new BoatsSelectView({ collection: collection });
				self.subViews.push(boatsView);
				self.$el.find('.boats').html(boatsView.render().el);

			};

			var collectionFetchError = function(error) {

				console.log(error);

			};

			Parse.User.current().get('host').relation('boats').query().collection().fetch().then(boatsFetchSuccess, collectionFetchError);


			var eventYear = this.model.get('date') ? this.model.get('date').substring(6) : new Date().getFullYear();
			for(var i = eventYear; i < new Date().getFullYear() + 3; i++) {
				var opt = $('<option>').val(i).text(i);
				if( eventYear == i ) opt.attr('selected', 1);
				this.$el.find('[name="eventYear"]').append(opt);
			}
			
			return this;

		},

		debugAutofillFields: function() {

			this._in('name').val('Summer sound festival');
			this._in('price').val('25');
			this._in('availableSeats').val('10');
			this._in('minimumSeats').val('5');
			this._in('description').val('This event has many top DJs in the world.');

		},

		save: function(event) {

			event.preventDefault();
			var self = this;
			var baseStatus = this.model.get('status');

			var data = {

				status: 'complete',

				name: this._in('name').val(), 
				description: this._in('description').val(),
				date: this._in('eventMonth').val() + "/" + this._in('eventDay').val() + "/" + this._in('eventYear').val(),
				time: this._in('departureHour').val() + ":" + this._in('departureMinute').val() + " " + this._in('period').val(), 
				boat: this._in('boat').val(), 
				captain: this._in('captain').val(), 
				location: null,
				duration: this._in('duration').val(), 
				price: this._in('price').val(), 
				availableSeats: this._in('availableSeats').val(), 
				minimumSeats: this._in('minimumSeats').val(), 
				bookingPolicy: this.$el.find('[name="bookingPolicy"]:checked').val(),
				cancellationPolicy: this.$el.find('[name="cancellationPolicy"]:checked').val()

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
				
				self.buttonLoader();

				if( error.type && error.type == 'model-validation' ) {
					console.log(error);
					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});

				} else {

					console.log(error);
					self._error(error);

				}

			};
			
			this.model.save(data).then(saveSuccess, saveError);


		}
	});
	return BoatdayView;

});