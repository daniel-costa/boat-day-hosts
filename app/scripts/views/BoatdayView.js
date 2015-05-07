define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'views/BoatsSelectView',
'text!templates/BoatdayTemplate.html',
'models/BoatModel',
], function($, _, Parse, BaseView, BoatsSelectView, BoatdayTemplate, BoatModel){
	var BoatdayView = BaseView.extend({

		className:"view-event",

		template: _.template(BoatdayTemplate),

		debug: true,

		events: {
			
			"submit form" : "save",
			'change [name="activity"]' : "refreshActivity", 
			'change [name="featuresFishingEquipment"]': "showFishingEquipment", 
			'change [name="featuresSportsEquipment"]': "showSportsEquipment"
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


			var dateYear = this.model.get('date') ? this.model.get('date').getFullYear() : new Date().getFullYear();
			for(var i = dateYear; i < new Date().getFullYear() + 3; i++) {
				var opt = $('<option>').val(i).text(i);
				if( dateYear == i ) opt.attr('selected', 1);
				this.$el.find('[name="dateYear"]').append(opt);
			}

			this.refreshActivity();
			return this;

		},

		debugAutofillFields: function() {

			this._in('name').val('Summer sound festival');
			this._in('price').val('25');
			this._in('availableSeats').val('10');
			this._in('minimumSeats').val('5');
			this._in('description').val('This event has many top DJs in the world.');

		},

		refreshActivity: function() {

			var activity = this._in('activity').val();
			this.$el.find('.activityContainer').hide();
			this.$el.find(".activityContainer." + activity).show();
		
		},

		showFishingEquipment: function() {
			console.log(123);
			this.$el.find('.activityContainer.fishing .equipment-list').toggle();

		},

		showSportsEquipment:function() {

			this.$el.find('.activityContainer.sports .equipment-list').toggle();

		},

		save: function(event) {

			event.preventDefault();
			var self = this;
			var baseStatus = this.model.get('status');

			var data = {

				status: 'complete',
				description: this._in('description').val(),
				date: new Date(this._in('dateYear').val(), this._in('dateMonth').val()-1, this._in('dateDay').val(), this._in('dateHours').val(), this._in('dateMinutes').val(), 0),
				captain: this._in('captain').val(), 
				location: null,
				duration: parseInt(this._in('duration').val()), 
				price: parseInt(this._in('price').val()), 
				availableSeats: parseInt(this._in('availableSeats').val()), 
				minimumSeats: parseInt(this._in('minimumSeats').val()), 
				bookingPolicy: this.$el.find('[name="bookingPolicy"]:checked').val(),
				cancellationPolicy: this.$el.find('[name="cancellationPolicy"]:checked').val(), 
				category: this._in('activity').val(),
				features: {
					leisure: {
						cruising: this.$el.find('[name="featuresLeisureCruising"]').is(':checked'),
						partying: this.$el.find('[name="featuresLeisurePartying"]').is(':checked'),
						sightseeing: this.$el.find('[name="featuresLeisureSightseeing"]').is(':checked'),
						other: this.$el.find('[name="featuresLeisureOther"]').is(':checked')
					},
					fishing: {
						flats: this.$el.find('[name="featuresFishingFlats"]').is(':checked'),
						lake: this.$el.find('[name="featuresFishingLake"]').is(':checked'),
						offshore: this.$el.find('[name="featuresFishingOffshore"]').is(':checked'),
						recreational: this.$el.find('[name="featuresFishingRecreational"]').is(':checked'),
						other: this.$el.find('[name="featuresFishingOther"]').is(':checked'),
						equipment: this.$el.find('[name="featuresFishingEquipment"]').is(':checked'),
						equipmentItems: {
							bait: this.$el.find('[name="featuresFishingEquipmentItemsBait"]').is(':checked'),
							lines: this.$el.find('[name="featuresFishingEquipmentItemsLines"]').is(':checked'),
							hooks: this.$el.find('[name="featuresFishingEquipmentItemsHooks"]').is(':checked'),
							lures: this.$el.find('[name="featuresFishingEquipmentItemsLures"]').is(':checked'),
							nets: this.$el.find('[name="featuresFishingEquipmentItemsNets"]').is(':checked'),
							rods: this.$el.find('[name="featuresFishingEquipmentItemsRods"]').is(':checked'),
							sinkers: this.$el.find('[name="featuresFishingEquipmentItemsSinkers"]').is(':checked')
						}
					},
					sports: {
						snorkeling: this.$el.find('[name="featuresSportsSnorkeling"]').is(':checked'),
						tubing: this.$el.find('[name="featuresSportStubing"]').is(':checked'),
						wakeBoarding: this.$el.find('[name="featuresSportsWakeBoarding"]').is(':checked'),
						waterSkiing: this.$el.find('[name="featuresSportsWaterSkiing"]').is(':checked'),
						equipment: this.$el.find('[name="featuresSportsEquipment"]').is(':checked'),
						equipmentItems: {
							fins: this.$el.find('[name="featuresSportsEquipmentItemsFins"]').is(':checked'),
							helmets: this.$el.find('[name="featuresSportsEquipmentItemsHelmets"]').is(':checked'),
							masks: this.$el.find('[name="featuresSportsEquipmentItemsMasks"]').is(':checked'),
							snorkels: this.$el.find('[name="featuresSportsEquipmentItemsSnorkels"]').is(':checked'),
							towLine: this.$el.find('[name="featuresSportsEquipmentItemsTowLine"]').is(':checked'),
							tubes: this.$el.find('[name="featuresSportsEquipmentItemsTubes"]').is(':checked'),
							wakeboard: this.$el.find('[name="featuresSportsEquipmentItemsWakeboard"]').is(':checked'),
							waterSkis: this.$el.find('[name="featuresSportsEquipmentItemsWaterSkis"]').is(':checked')
						}
					},
					global: {
						children: this.$el.find('[name="featuresGlobalChildren"]').is(':checked'),
						smoking: this.$el.find('[name="featuresGlobalSmoking"]').is(':checked'),
						drinking: this.$el.find('[name="featuresGlobalDrinking"]').is(':checked'),
						pets: this.$el.find('[name="featuresGlobalPets"]').is(':checked') 
					}, 
					extras: {
						food: this.$el.find('[name="featuresExtrasFood"]').is(':checked'),
						drink: this.$el.find('[name="featuresExtrasDrink"]').is(':checked'),
						music: this.$el.find('[name="featuresExtrasMusic"]').is(':checked'),
						towels: this.$el.find('[name="featuresExtrasTowels"]').is(':checked'),
						sunscreen: this.$el.find('[name="featuresExtrasSunscreen"]').is(':checked'),
						inflatables: this.$el.find('[name="featuresExtrasInflatables"]').is(':checked')
					}
				}
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
			
			var boatSuccess = function(boat) {

				data.boat = boat;
				self.model.save(data).then(saveSuccess, saveError);

			};

			new Parse.Query(BoatModel).get(this._in('boat').val()).then(boatSuccess, saveError);

		}
	});
	return BoatdayView;

});