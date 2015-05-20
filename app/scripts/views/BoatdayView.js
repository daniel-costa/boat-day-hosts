define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'views/BoatsSelectView',
'text!templates/BoatDayTemplate.html',
'models/BoatModel',
], function($, _, Parse, BaseView, BoatsSelectView, BoatDayTemplate, BoatModel){
	var BoatDayView = BaseView.extend({

		className:"view-event",

		template: _.template(BoatDayTemplate),

		debug: false,

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

			var query = Parse.User.current().get('host').relation('boats').query();
			query.ascending('name');
			query.collection().fetch().then(boatsFetchSuccess, collectionFetchError);

			var dateYear = this.model.get('date') ? this.model.get('date').getFullYear() : new Date().getFullYear();
			for(var i = dateYear; i < new Date().getFullYear() + 3; i++) {
				var opt = $('<option>').val(i).text(i);
				if( dateYear == i ) opt.attr('selected', 1);
				this.$el.find('[name="dateYear"]').append(opt);
			}

			this.$el.find('.date').datepicker({
				format: 'mm/dd/yyyy',
				startDate: '0d',
				todayBtn: true,
				todayHighlight: true,
				autoclose: true
			}).datepicker('setUTCDate', this.model.get('date'));
			console.log(this.model.get('date'));

			this._in('availableSeats').slider({ 
				tooltip: 'hide'
			}).on("slide", function(slideEvt) {
				self.$el.find('.preview-availableSeats').text(slideEvt.value  + ' available seats');
			}).slider('setValue', this._in('availableSeats').slider('getValue'), true, false);

			this._in('duration').slider({
				tooltip: 'hide'
			}).on("slide", function(slideEvt) {
				var display = slideEvt.value + ' hour' + (slideEvt.value != 1 ? 's' : '')
				self.$el.find('.preview-duration').text(display);
			}).slider('setValue', this._in('duration').slider('getValue'), true, false)

			this._in('price').slider({
				tooltip: 'hide'
			}).on("slide", function(slideEvt) {
				self.refreshPriceHint(slideEvt.value);
				self.$el.find('.preview-price').text(slideEvt.value  + ' USD');
			}).slider('setValue', this._in('price').slider('getValue'), true, false)

			this._in('departureTime').slider({
				tooltip: 'hide'
			}).on("slide", function(slideEvt) {
				var display = self.departureTimeToDisplayTime(slideEvt.value);
				self.$el.find('.preview-departureTime').text(display);
			}).slider('setValue', this._in('departureTime').slider('getValue'), true, false)

			this.refreshActivity();

			return this;

		},

		refreshPriceHint: function(price) {
			
			var text = 'high';


			if( price < 40 ) {
				text = 'afordable';
			} else if( price < 80 ) {
				text = 'moderate';
			}

			this.$el.find('.priceHint').html('<span class="glyphicon glyphicon-info-sign"></span> BoatDay\s users will considerate this price as <strong>' + text + '</strong>.');
		},

		debugAutofillFields: function() {

			if( this.model.get('status') == 'creation' ) {
				this._in('name').val('Summer sound festival');
				this._in('price').val('25');
				this._in('availableSeats').val('5');
				this._in('description').val('This event has many top DJs in the world.');
			}
		},

		refreshActivity: function() {

			var activity = this._in('activity').val();
			this.$el.find('.activityContainer').hide();
			this.$el.find(".activityContainer." + activity).show();
		
		},

		showFishingEquipment: function() {

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
				name: this._in('name').val(),
				description: this._in('description').val(),
				date: this._in('date').datepicker('getUTCDate'),
				departureTime: this._in('departureTime').slider('getValue'),
				captain: this._in('captain').val(), 
				location: null,
				availableSeats: self._in('availableSeats').slider('getValue'),
				duration: self._in('duration').slider('getValue'),
				price: self._in('price').slider('getValue'), 
				bookingPolicy: this.$el.find('[name="bookingPolicy"]:checked').val(),
				cancellationPolicy: this.$el.find('[name="cancellationPolicy"]:checked').val(), 
				category: this._in('activity').val(),
				features: {
					leisure: {
						cruising: Boolean(this.$el.find('[name="featuresLeisureCruising"]').is(':checked')),
						partying: Boolean(this.$el.find('[name="featuresLeisurePartying"]').is(':checked')),
						sightseeing: Boolean(this.$el.find('[name="featuresLeisureSightseeing"]').is(':checked')),
						other: Boolean(this.$el.find('[name="featuresLeisureOther"]').is(':checked'))
					},
					fishing: {
						flats: Boolean(this.$el.find('[name="featuresFishingFlats"]').is(':checked')),
						lake: Boolean(this.$el.find('[name="featuresFishingLake"]').is(':checked')),
						offshore: Boolean(this.$el.find('[name="featuresFishingOffshore"]').is(':checked')),
						recreational: Boolean(this.$el.find('[name="featuresFishingRecreational"]').is(':checked')),
						other: Boolean(this.$el.find('[name="featuresFishingOther"]').is(':checked')),
						equipment: Boolean(this.$el.find('[name="featuresFishingEquipment"]').is(':checked')),
						equipmentItems: {
							bait: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsBait"]').is(':checked')),
							lines: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsLines"]').is(':checked')),
							hooks: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsHooks"]').is(':checked')),
							lures: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsLures"]').is(':checked')),
							nets: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsNets"]').is(':checked')),
							rods: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsRods"]').is(':checked')),
							sinkers: Boolean(this.$el.find('[name="featuresFishingEquipmentItemsSinkers"]').is(':checked'))
						}
					},
					sports: {
						snorkeling: Boolean(this.$el.find('[name="featuresSportsSnorkeling"]').is(':checked')),
						tubing: Boolean(this.$el.find('[name="featuresSportStubing"]').is(':checked')),
						wakeBoarding: Boolean(this.$el.find('[name="featuresSportsWakeBoarding"]').is(':checked')),
						waterSkiing: Boolean(this.$el.find('[name="featuresSportsWaterSkiing"]').is(':checked')),
						equipment: Boolean(this.$el.find('[name="featuresSportsEquipment"]').is(':checked')),
						equipmentItems: {
							fins: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsFins"]').is(':checked')),
							helmets: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsHelmets"]').is(':checked')),
							masks: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsMasks"]').is(':checked')),
							snorkels: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsSnorkels"]').is(':checked')),
							towLine: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsTowLine"]').is(':checked')),
							tubes: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsTubes"]').is(':checked')),
							wakeboard: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsWakeboard"]').is(':checked')),
							waterSkis: Boolean(this.$el.find('[name="featuresSportsEquipmentItemsWaterSkis"]').is(':checked'))
						}
					},
					global: {
						children: Boolean(this.$el.find('[name="featuresGlobalChildren"]').is(':checked')),
						smoking: Boolean(this.$el.find('[name="featuresGlobalSmoking"]').is(':checked')),
						drinking: Boolean(this.$el.find('[name="featuresGlobalDrinking"]').is(':checked')),
						pets: Boolean(this.$el.find('[name="featuresGlobalPets"]').is(':checked')) 
					}, 
					extras: {
						food: Boolean(this.$el.find('[name="featuresExtrasFood"]').is(':checked')),
						drink: Boolean(this.$el.find('[name="featuresExtrasDrink"]').is(':checked')),
						music: Boolean(this.$el.find('[name="featuresExtrasMusic"]').is(':checked')),
						towels: Boolean(this.$el.find('[name="featuresExtrasTowels"]').is(':checked')),
						sunscreen: Boolean(this.$el.find('[name="featuresExtrasSunscreen"]').is(':checked')),
						inflatables: Boolean(this.$el.find('[name="featuresExtrasInflatables"]').is(':checked'))
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
	return BoatDayView;

});