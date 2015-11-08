define([
	//'async!https://maps.google.com/maps/api/js?sensor=false',
	//'async!https://maps.google.com/maps/api/js?sensor=false&libraries=places!callback',
	//'async!https://maps.googleapis.com/maps/api/js?signed_in=true&libraries=places&callback=initMap"',
	'views/BaseView',
	'models/BoatDayModel',
	'models/ChatMessageModel',
	'models/NotificationModel',
	'models/FileHolderModel',
	'text!templates/BoatDayOverviewTemplate.html',
	'text!templates/BoatDayOverviewInfoTemplate.html',
	'text!templates/BoatDayOverviewEditTemplate.html',
	'text!templates/BoatDayOverviewGroupChatTemplate.html',
	'text!templates/BoatDayOverviewBookingTemplate.html',
	'text!templates/BoatDayOverviewQuestionsTemplate.html',
	'text!templates/BoatDayOverviewCancelTemplate.html',
	'text!templates/BoatDayOverviewRescheduleTemplate.html',
	'text!templates/BoatDayOverviewChatMessageTemplate.html',
	'text!templates/BoatDayOverviewBoookingRowTemplate.html',
	'text!templates/BoatDayNewQuestionRowTemplate.html',
	'text!templates/BoatDayOldQuestionRowTemplate.html',
	'text!templates/BoatDayOverviewRatingRowTemplate.html',
	'text!templates/BoatdayOverViewReadOnlyTemplate.html',
	'text!templates/BoatDayPictureTemplate.html'
	], function(BaseView, BoatDayModel, ChatMessageModel, NotificationModel, FileHolderModel, BoatDayOverviewTemplate, BoatDayOverviewInfoTemplate, BoatDayOverviewEditTemplate, BoatDayOverviewGroupChatTemplate, BoatDayOverviewBookingTemplate, BoatDayOverviewQuestionsTemplate, BoatDayOverviewCancelTemplate, BoatDayOverviewRescheduleTemplate, BoatDayOverviewChatMessageTemplate, BoatDayOverviewBoookingRowTemplate, BoatDayNewQuestionRowTemplate, BoatDayOldQuestionRowTemplate, BoatDayOverviewRatingRowTemplate, BoatdayOverViewReadOnlyTemplate, BoatDayPictureTemplate){

		var BoatdayOveviewView = BaseView.extend({

			className:"view-overview",

			template: _.template(BoatDayOverviewTemplate),

			events: {
				'click .boatday-overview-edit a.trigger': 'processBoatDayEdit',
				'click .boatday-overview-group-chat a.trigger': 'processBoatDayGroupChat',
				'click .boatday-overview-booking-requests a.trigger': 'processBookingRequests',
				'click .boatday-overview-questions a.trigger': 'processQuestions',
				'click .boatday-overview-read-only a.trigger': 'processReadOnly',
				'click .btn-cancel': 'cancelBoatDay',
				'click .btn-duplicate': 'duplicate',
				'click .btn-reschedule': 'rescheduleBoatDay',
				'submit form[name="edit-form"]': 'updateBoatDay',
				'change [name="boat"]' : "boatSelected",
				'change [name="activity"]' : "refreshActivity", 
				'change [name="featuresFishingEquipment"]': "showFishingEquipment", 
				'change [name="featuresSportsEquipment"]': "showSportsEquipment",
				'blur [name="description"]': 'censorField',
				"click .approve-request": "approveRequest",
				"click .deny-request": "denyRequest",
				"click .profile-picture": "detectClickOnProfile",
				"click .submit-answer": "submitAnswer",
				"mouseover .stars img": "rateOver",
				"mouseout .stars img": "rateOut",
				"click .rate-guest": "submitRating",
				"click .stars img": "rate",
				"click .chat-text-area .enter-chat-text": "submitChat",
				"click .overviewinfo-right a.info-pending-link": "processOpenBookingRow",
				"click .overviewinfo-right a.info-question-link": "processOpenQuestionRow",
				"click .overviewinfo-right a.info-message-link" : "processOpenChatRow",
				"click .overviewinfo-right a.info-review-link" : "processOpenReviewRow",
				"change .upload": "uploadNewFile",
				"click .boatday-pic-thumbs img.addImage": "clickUpload",
				"click .delete-picture": 'deleteBoatDayPicture',
				"click .boatday-pic-thumbs img.thumb": 'showLargePic'

			},

			theme: "dashboard",

			_map: null,

			_marker: null,

			collectionBoats: {},
			collectionCaptains: {},

			//collection seat requests
			collectionSeatRequests: {},
			collectionPendingSeatRequests: [],
			collectionApprovedSeatRequests: [],
			collectionCancelledSeatRequests: [],
			collectionRejectedSeatRequests: [],
			collectionPendingGuestRequests: [],

			//collection question requests
			collectionQuestions: {},
			collectionUnAnsweredQuestions: [],
			collectionAnsweredQuestions: [],

			//Host review collection
			collectionNoHostYesGuestReviews: [],
			collectionNoHostNoGuestReviews: [],
			collectionYesHostYesGuestReviews: [],
			collectionYesHostNoGuestReviews: [],

			chatLastFetch: null,

			isReadOnly: true,

			isPastBoatDay: false,

			divsToShow: [],

			boatdayPictures: {},

			boatdayPics: [],

			initialize: function(data) {

				var self = this;

				var queryArray = self.splitURLParams( data.queryString);

				var divs = queryArray['show'];

				this.divsToShow = [];

				if(divs != undefined) { this.divsToShow = divs.split(","); }


				// Base Date
				var _bd = new Date(this.model.get('date'));

				// Base Arrival Time
				var _bt = this.model.get('arrivalTime');

				// Today date
				var _td = new Date();

				// Today date min
				var _tdn = new Date(_td.getFullYear(), _td.getMonth(), _td.getDate(), 0, 0, 0, 0);

				// Today date max
				var _tdx = new Date(_td.getFullYear(), _td.getMonth(), _td.getDate(), 23, 59, 59, 999);

				// Current Time
				var _ct = _td.getHours() + ( _td.getMinutes() >= 30 ? 0.5 : 0 );

				if( _bd < _tdn || ( _bd < _tdx && _bt <= _ct ) ) {
					this.isPastBoatDay = true;
				} 

			},

			render: function() {

				BaseView.prototype.render.call(this);

				var self = this;
				var boatday = this.model;
				var SeatRequest = Parse.Object.extend("SeatRequest");
				var Question = Parse.Object.extend("Question");

	
				self.collectionBoats = {};
				self.collectionCaptains = {};

				//questions collection
				self.collectionSeatRequests = {};
				self.collectionQuestions = {};
				self.collectionUnAnsweredQuestions = [];
				self.collectionAnsweredQuestions = [];

				//seat requests collection
				self.collectionPendingSeatRequests =  [];
				self.collectionApprovedSeatRequests = [];
				self.collectionCancelledSeatRequests = [];
				self.collectionRejectedSeatRequests = [];
				self.collectionPendingGuestRequests = [];

				//Host review collection
				self.collectionNoHostYesGuestReviews = [];
				self.collectionNoHostNoGuestReviews = [];
				self.collectionYesHostYesGuestReviews = [];
				self.collectionYesHostNoGuestReviews = [];

				var qSeatRequest = new Parse.Query(SeatRequest);
				qSeatRequest.equalTo("boatday", boatday);
				qSeatRequest.include('profile.user');
				qSeatRequest.include('boatday');
				qSeatRequest.descending("updatedAt");

				var qQuestion = new Parse.Query(Question);
				qQuestion.equalTo("status", "approved");
				qQuestion.equalTo("boatday", boatday);
				qQuestion.include("boatday");
				qQuestion.include("from");
				qQuestion.descending("updatedAt");

				Parse.Promise.when(qSeatRequest.find(), qQuestion.find()).then(function(seatRequests, questions){

					_.each(seatRequests, function(request){
						
						self.collectionSeatRequests[request.id] = request;

						if(request.get('status') == "pending"){
							self.collectionPendingSeatRequests.push(request);
						}

						if(request.get('status') == "approved"){
							
							self.collectionApprovedSeatRequests.push(request);

							var rateByGuest = request.get("ratingGuest") != null ? request.get("ratingGuest") : 0;
							var rateByHost = request.get("ratingHost") != null ? request.get("ratingHost") : 0;

							if((rateByGuest + rateByHost) < 1){ //no host no guest
								self.collectionNoHostNoGuestReviews.push(request);
							}
							else if ( (rateByHost < 1) && (rateByGuest > 0) ){ //no host yes guest
								self.collectionNoHostYesGuestReviews.push(request);
							}
							else if( (rateByHost > 0) && (rateByGuest < 1)){ //yes host no guest
								self.collectionYesHostNoGuestReviews.push(request);
							}
							else if ( (rateByHost > 0) && (rateByGuest > 0) ){ //yes host yest guest
								self.collectionYesHostYesGuestReviews.push(request);
							}
						}

						if(request.get('status') == "cancelled-host"){
							self.collectionCancelledSeatRequests.push(request);
						}

						if(request.get('status') == "cancelled-guest"){
							self.collectionCancelledSeatRequests.push(request);
						}

						if(request.get('status') == "denied"){
							self.collectionRejectedSeatRequests.push(request);
						}

						if(request.get('status') == "pending-guest"){
							self.collectionPendingGuestRequests.push(request);
						}

					});

					_.each(questions, function(question){

						self.collectionQuestions[question.id] = question;
							
							if((question.get("answer") == null) || question.get("answer") == ""){
								self.collectionUnAnsweredQuestions.push(question);
							}else{
								self.collectionAnsweredQuestions.push(question);
							}
					});


					if(boatday.get("status") != "cancelled"){
						if( self.collectionPendingSeatRequests.length + self.collectionApprovedSeatRequests.length === 0 ) {
							self.isReadOnly = false;
						}
					}

					self.renderBoatDayInfo();

					if(self.isPastBoatDay || self.isReadOnly){
						self.renderisReadOnly();
					} else {
						self.renderEditBoatDay();
					}

					self.renderGroupChat();
					
					self.renderBookingRequests();
					
					self.renderQuestions();
					
					self.renderCancelBoatDay();

					if((self.divsToShow).indexOf("request") > -1){
						self.$el.find('.boatday-booking-requests').show();
						
						var elem = self.$el.find('.boatday-overview-booking-requests');
						var main = self.$el.find('.inner-content');
		        
		        		self.scrollToTarget(main, elem); 
					}
					if((self.divsToShow).indexOf("question") > -1){
						self.$el.find('.boatday-question').show();
						var elem = self.$el.find('.boatday-overview-questions');
						var main = self.$el.find('.inner-content');

						self.scrollToTarget(main, elem);
					}
					if((self.divsToShow).indexOf("message") > -1){
						self.$el.find('.boatday-group-chat-form').show();
						var elem = self.$el.find('.boatday-overview-group-chat');
						var main = self.$el.find('.inner-content');
		        
		        		self.scrollToTarget(main, elem);
					}
				
				});
			
				return this;
			
			},

			renderBoatDayInfo: function(){

				var self = this;

				var boatday = this.model;

				var tpl = _.template(BoatDayOverviewInfoTemplate);
				var target = self.$el.find('.dashboard-canvas .boatday-overview-info');
				target.html('');

				var baseRate = self.getHostRate(Parse.User.current().get('host').get('type'));
				var pricePerSeat = boatday.get('price');
				var totalSeats = boatday.get('bookedSeats');
				var totalPriceUSD = pricePerSeat * totalSeats;
				var totalBoatDayUSD = baseRate * totalPriceUSD;
				var totalPartnerDiscountPercent = baseRate - Parse.User.current().get('host').get('rate');
				var totalPartnerDiscount = totalPartnerDiscountPercent * totalPriceUSD;
				var totalHostUSD = totalPriceUSD - (totalBoatDayUSD - totalPartnerDiscount);

				var bDate = new Date(boatday.get("date"));
				
				var _tpl = tpl({
					name: boatday.get("name"),
					date: self.formatDateWithMonthAndDate(boatday.get("date")) + ", " + bDate.getFullYear(),
					bookedSeats: boatday.get("bookedSeats"),
					self: self,
					boatday: boatday,
					totalHostUSD: totalHostUSD
				});

				target.append(_tpl);

				self.displayNewBookingCount(self.collectionPendingSeatRequests.length);

				if(self.isPastBoatDay){

					self.displayNewBookingCount(self.collectionNoHostYesGuestReviews.length + self.collectionYesHostYesGuestReviews.length);

				} else {

					self.displayNewQuestionCount(self.collectionUnAnsweredQuestions.length);

					self.displayNewBookingCount(self.collectionPendingSeatRequests.length + self.collectionPendingGuestRequests.length);

				}

			},

			renderisReadOnly: function(){


				var self = this;
				var boatday = this.model;

				var tpl = _.template(BoatdayOverViewReadOnlyTemplate);
				var target = self.$el.find('.dashboard-canvas .boatday-overview-read-only');
				target.html('');

				var queryBoat = new Parse.Query(Parse.Object.extend('Boat'));
				var queryCaptain = new Parse.Query(Parse.Object.extend('Profile'));

				var _d = new Date(boatday.get('date'));

				var baseRate = self.getHostRate(Parse.User.current().get('host').get('type'));
				var pricePerSeat = boatday.get('price');
				var totalSeats = boatday.get('bookedSeats');
				var totalPriceUSD = pricePerSeat * totalSeats;
				var totalBoatDayUSD = baseRate * totalPriceUSD;
				var totalPartnerDiscountPercent = baseRate - Parse.User.current().get('host').get('rate');
				var totalPartnerDiscount = totalPartnerDiscountPercent * totalPriceUSD;
				var totalHostUSD = totalPriceUSD - (totalBoatDayUSD - totalPartnerDiscount);

				var features = boatday.get('features');
				var category = boatday.get('category');
				var categoryItems = [];
				var equipments = [];
				var extras = [];
				var familySettings = [];

			    $.each(features,function(k, v){
			          
			          if(k == category){

			          		$.each(v, function(k2, v2){
			          				if((v2 == true) && (k2 != "equipment")){
			          					categoryItems.push(k2.charAt(0).toUpperCase() + k2.slice(1));
			          				}
			          				else{
			          					if(k2 == "equipmentItems"){
			          						$.each(v2, function(k3, v3){	
			          							if(v3 == true){
			          								equipments.push(k3.charAt(0).toUpperCase() + k3.slice(1));
			          							}
			          						});
			          					}
			          				}
			          		});

			          }
			          if(k == "extras"){

			          	$.each(v, function(ek, ev){
			          		if(ev == true){
			          			extras.push(ek.charAt(0).toUpperCase() + ek.slice(1));
			          		}
			          	});
			          }

			          if(k == "global"){
			          	$.each(v, function(gk, gv){
			          		if(gv == true){
			          			var str = "";

			          			switch(gk){
			          				case "children":
			          					str = "Children allowed";
			          					break;
			          				case "smoking":
			          					str = "Smoking Permitted";
			          					break;
			          				case "drinking":
			          					str = "Drinking Permitted";
			          					break;
			          				case "pets":
			          					str = "Pets Permitted";
			          					break;
			          			}

			          			familySettings.push(str);
			          		}
			          	});
			          }

				});
			

				Parse.Promise.when(queryBoat.get(boatday.get('boat').id), queryCaptain.get(boatday.get('captain').id)).then(function(boat, captain){
					

					var bookingPolicy = "";

					switch(boatday.get("bookingPolicy")){
						case "manually":
							bookingPolicy = "Manual Book";
							break;
						case "automatically":
							bookingPolicy = "Instant Book";
							break;
					}

					var infoMessage = "";

					if( boatday.get("status") == "cancelled" ){
						infoMessage = "Cancellation Message: " + boatday.get("cancelReason");
					}
					
					else if ( self.isPastBoatDay ) {
						infoMessage = "Details cannot be edited for past BoatDays.";
					}

					else{
						infoMessage = 'You may only edit the details of a BoatDay if there are no pending or approved Guest requests. For any emergency changes, please contact BoatDay Team through the  <a href="#/help-center">Help Center</a>.';
					}

					var display = "none";

					if((self.divsToShow).indexOf("detail") > -1){
						display = "block";
					}

					var _tpl = tpl({
						display: display,
						infoMessage: infoMessage,
						name: self.model.get("name"),
						boatday: self.model,
						boat: boat,
						captain: captain,
						boatdayDate: ((_d.getMonth() + 1) + "/" + _d.getDate() + "/" + _d.getFullYear().toString().substr(2,2)),
						self: self,
						totalHostUSD: totalHostUSD,
						totalPriceUSD: totalPriceUSD,
						totalBoatDayUSD: totalBoatDayUSD,
						categoryItems: categoryItems,
						equipments: equipments,
						extras: extras,
						familySettings: familySettings,
						category: boatday.get('category').charAt(0).toUpperCase() + boatday.get('category').slice(1),
						bookingPolicy: bookingPolicy,
						cancellationPolicy: boatday.get('cancellationPolicy').charAt(0).toUpperCase() + boatday.get('cancellationPolicy').slice(1)
					});

					target.append(_tpl);
					self.$el.find('[data-toggle="tooltip"]').tooltip();
				});

			},

			renderEditBoatDay: function(){
				var self = this;

				self.boatdayPictures = {};
				self.boatdayPics = [];

				var tpl = _.template(BoatDayOverviewEditTemplate);
				var target = self.$el.find('.dashboard-canvas .boatday-overview-edit');
				target.html('');

				var _tpl = tpl({
					name: this.model.get("name"),
					date: self.dateParseToDisplayDate(this.model.get("date")),
					availableSeats: this.model.get("availableSeats"),
					departureTime: this.model.get("departureTime"),
					duration: this.model.get("duration"),
					price: this.model.get("price"),
					category: this.model.get("category"),
					features: this.model.get("features"),
					description: this.model.get("description"),
					bookingPolicy: this.model.get("bookingPolicy"),
					cancellationPolicy: this.model.get("cancellationPolicy"),
					readOnly: self.isReadOnly,
					self: self
				});


				target.append(_tpl);
				
				self.$el.find('[data-toggle="tooltip"]').tooltip();

				var boatsFetchSuccess = function(matches) {

					if(self.isReadOnly){
						var select = $('<select>').attr({ id: 'boat', name: 'boat', class: 'form-control', disabled:'disabled' });
					}
					else{
						var select = $('<select>').attr({ id: 'boat', name: 'boat', class: 'form-control' });
					}

						_.each(matches, function(boat) {

							var selected = (boat.id == self.model.get("boat").id ? "selected" : "");
							var opt = $('<option '+selected+'>').attr('value', boat.id).text(boat.get('name') + ', ' + boat.get('type'));
							select.append(opt);
							self.collectionBoats[boat.id] = boat;

						});
						self.$el.find('.boats').html(select);
						select.change();
				};

				var queryBoats = Parse.User.current().get('host').relation('boats').query();
				queryBoats.ascending('name');
				queryBoats.find().then(boatsFetchSuccess);

				// Todo change startDate by 0d after 11 Jul. 2015
				this.$el.find('.date').datepicker({
					startDate: '0d',
					autoclose: true
				});

				if( this.model.get('date') ) {
					
					this.$el.find('.date').datepicker('setDate', this.model.get('date'));
				}

				
				var slidersConfig = { 
					tooltip: 'hide',
					enabled: !self.isReadOnly
				};

				var updateTotalCalculator = function() {
					// ToDo take value from parse config
					var baseRate = self.getHostRate(Parse.User.current().get('host').get('type'));
					var pricePerSeat = self._in('price').slider('getValue');
					var totalSeats = self._in('availableSeats').slider('getValue');
					var totalPriceUSD = pricePerSeat * totalSeats;
					var totalBoatDayUSD = baseRate * totalPriceUSD;
					var totalPartnerDiscountPercent = baseRate - Parse.User.current().get('host').get('rate');
					var totalPartnerDiscount = totalPartnerDiscountPercent * totalPriceUSD;
					var totalHostUSD = totalPriceUSD - (totalBoatDayUSD - totalPartnerDiscount);

					self.$el.find('.totalSeats').text(totalSeats + " seats x $" + pricePerSeat);
					self.$el.find('.totalPriceUSD').text('$' + totalPriceUSD);
					self.$el.find('.totalBoatDayUSD').text('-$' + totalBoatDayUSD);
					self.$el.find('.totalHostUSD').text('$' + totalHostUSD);

					if( totalPartnerDiscountPercent > 0 ) {
						self.$el.find('.partnerDiscount').show();
						self.$el.find('.totalPartnerDiscount').text('$' + Math.round(totalPartnerDiscount));
					}
				};

				var availableSeatsSlideEvent = function(slideEvt) {
					self.$el.find('.preview-availableSeats').text(slideEvt.value  + ' available seats');
					updateTotalCalculator();
				};

				var durationSlideEvent = function(slideEvt) {
					self.$el.find('.preview-duration').text(slideEvt.value + ' hour' + (slideEvt.value != 1 ? 's' : ''));
				};

				var priceSlideEvent = function(slideEvt) {
					self.$el.find('.preview-price').text('$'+slideEvt.value);
					updateTotalCalculator();
				};

				var departureTimeSlideEvent = function(slideEvt) {
					var maxDuration = Math.min(12, 24 - slideEvt.value);
					var duration = self._in('duration').slider('getValue');
					self._in('duration').slider({max: maxDuration}).slider('setValue', duration > maxDuration ? maxDuration : duration, true, false);
					self.$el.find('.preview-departureTime').text(self.departureTimeToDisplayTime(slideEvt.value));
				};
				
				this._in('availableSeats').slider(slidersConfig).on("slide", availableSeatsSlideEvent);
				this._in('departureTime').slider(slidersConfig).on("slide", departureTimeSlideEvent);
				this._in('duration').slider(slidersConfig).on("slide", durationSlideEvent);
				this._in('price').slider(slidersConfig).on("slide", priceSlideEvent);
				this._in('availableSeats').slider('setValue', this._in('availableSeats').slider('getValue'), true, false);
				this._in('departureTime').slider('setValue', this._in('departureTime').slider('getValue'), true, false);
				this._in('duration').slider('setValue', this._in('duration').slider('getValue'), true, false);
				this._in('price').slider('setValue', this._in('price').slider('getValue'), true, false);

				this.refreshActivity();
				this.setupGoogleMap();

				this.displayBoatDayPictures();
			
			},

			setupGoogleMap: function() {

				var self = this;

				require(["goog!maps,3,other_params:sensor=false&libraries=places"], function(){

					var displayMap = function(latlng) {

						var opts = {
							zoom: 11,
							center: latlng
						};

						//if( !self._map ) {

							var ctn = self.$el.find('.map').get(0);
							self._map = new google.maps.Map(ctn, opts);

  							google.maps.event.addListenerOnce(self._map, "idle", function(){
								google.maps.event.trigger(self._map, 'resize');
								self._map.setCenter(latlng);

							}); 

							google.maps.event.addListener(self._map, 'click', function(event) {
								self.moveMarker(event.latLng);
							});

							var input = document.getElementById('locationText');
							//var input = self.$el.find('#locationText');
  							var countryRestrict = {'country': 'us'};
  							//var countryRestrict = {};

  							//var searchBox = new google.maps.places.SearchBox(input);
  							 var autocomplete = new google.maps.places.Autocomplete((input), {
  							 	types: ['geocode'],
  							 	componentRestrictions: countryRestrict
  							 });

  							 self._map.addListener('bounds_changed', function() {
  							 
  							 autocomplete.setBounds(self._map.getBounds());});

  							 autocomplete.addListener('place_changed', function() {

  							 	var place = autocomplete.getPlace();
							    
							    var newlatlong = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());

							    self.moveMarker(newlatlong);

							});

							
						//}



					};

					var handlePosition = function(position) {
		    			displayMap(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
					};

					var handleNoPosition = function(error) {
						displayMap(new google.maps.LatLng(25.761919, -80.190225));
					};

					if (navigator.geolocation) {

						// Edit DC: 
						// The navigator takes too much time and blocks everything. We prefere to desactivate it.

						// navigator.geolocation.getCurrentPosition(handlePosition, handleNoPosition);
						handleNoPosition();

					} else {

						handleNoPosition();

					}

					self.centerMapInStart();

				});

			},

			centerMapInStart: function(){

				var self = this;

				if( self.model.get('location') ) {
					var loc = self.model.get('location');
					var latLng = new google.maps.LatLng(loc.latitude, loc.longitude);
					self.moveMarker(latLng);
				}

			},

			moveMarker: function(latlng) {

				var self = this;

				var gotAddress = function (results, status) {

					if (status === google.maps.GeocoderStatus.OK) {

						if (results[0]) {
							var addr = results[0].formatted_address;
							self._in('locationText').val(addr.slice(0, addr.lastIndexOf(",")));
						}

					}

				};

				self._map.panTo(latlng);

				new google.maps.Geocoder().geocode({ 'latLng': latlng }, gotAddress);

				if( self._marker ) {
					self._marker.setMap(null);
				}
						
				self._marker = new google.maps.Marker({
					map: self._map,
					draggable: true,
					animation: google.maps.Animation.DROP,
					position: latlng
				});

			},

			refreshActivity: function() {
				var activity = this._in('activity').val();
				this.$el.find('.activityContainer').hide();
				this.$el.find(".activityContainer." + activity).show();
			
			},

			showFishingEquipment: function() {
				
				this.$el.find('.activityContainer.fishing .equipment-list').toggle();
			
			},

			showFishingEquipment: function() {
				
				this.$el.find('.activityContainer.fishing .equipment-list').toggle();
			
			},

			showSportsEquipment:function() {
				
				this.$el.find('.activityContainer.sports .equipment-list').toggle();
			
			},

			renderGroupChat: function(){
				var self = this;

				var boatday = this.model;
				
				var tpl = _.template(BoatDayOverviewGroupChatTemplate);
				var target = self.$el.find('.dashboard-canvas .boatday-overview-group-chat');

				var infoMessage = "";

				if(boatday.get("status") == "cancelled"){
					infoMessage = "This BoatDay was cancelled, the chat is now deactivated.";
				}

				if (self.isPastBoatDay){
					infoMessage = "This BoatDay is over, the chat is now deactivated.";
				}

				target.html('');

				var _tpl = tpl({
					self: self,
					boatday: boatday,
					infoMessage: infoMessage
				});

				target.append(_tpl);

				var activateChat = !self.isPastBoatDay;

				if(boatday.get("status") == "cancelled") { activateChat = false; }

				if(activateChat){
					
					self.fetchChat(boatday);

					var t = setInterval(function() { self.fetchChat(boatday) }, 5000);
					
					self.timersToKill.push(t);

					//var textarea = self.$el.find('.dashboard-canvas .boatday-overview-group-chat .auto-expand-textarea');

					var textarea = document.getElementById("auto-expand-textarea");

					var sendBtn = self.$el.find('.dashboard-canvas .boatday-overview-group-chat .enter-chat-text');

					var limit = 200;

					textarea.oninput = function() {
					  textarea.style.height = "";
					  textarea.style.height = Math.min(textarea.scrollHeight, 300) + "px";

					  var textVal = self.$el.find('.dashboard-canvas .boatday-overview-group-chat .auto-expand-textarea').val();

					  if(textVal != ""){
					  	sendBtn.addClass("hovered");
					  } else{
					  	sendBtn.removeClass("hovered");
					  }

					};

				}
				else{

					self.$el.find('.dashboard-canvas .boatday-overview-group-chat .boatday-group-chat-form .box-messages').remove();
				}
				
			},

			displayNewChatCount: function(messageCount){
				
				var target = this.$el.find('.boatday-overview .boatday-overview-group-chat .new-chat-count');
				var infoMsgCountTarget = this.$el.find('.boatday-overview .overviewinfo-right .info-new-messages');
				var infoMsgLinkTarget = this.$el.find('.boatday-overview .overviewinfo-right .info-message-link');
				
				var pl = (messageCount == 1) ? '' : 's';

				infoMsgCountTarget.html(messageCount);
				infoMsgLinkTarget.html('New Chat</br> Message' + pl);

				if(messageCount > 0){

					target.html(' - <font color="#f8b62c"> new message</font>');

				}
				
				else{

					target.html("");
				}
				
			},

			displayNewQuestionCount: function(questionCount){
				
				var self = this;
			
				var target = this.$el.find('.boatday-overview-questions .new-question-count');

				var infoQuestionCountTarget = this.$el.find('.boatday-overview .overviewinfo-right .info-new-question');
				var infoQuestionLinkTarget = this.$el.find('.boatday-overview .overviewinfo-right .info-question-link');

				var pl = (questionCount == 1) ? '' : 's';

				if( !self.isPastBoatDay ) {

					infoQuestionCountTarget.html(questionCount);
					infoQuestionLinkTarget.html('New Guest</br> Question' + pl );
					
					if( questionCount > 0 ){
						//target.html(' - <font color="#f8b62c">'+ questionCount + " new question" + pl + "</font>");
						target.html(' - <font color="#f8b62c"> new question</font>');
					}
				}
			
			},

			renderBookingRequests: function(){

				var self = this;
				
				var boatday = this.model;

				var tpl = _.template(BoatDayOverviewBookingTemplate);
				var target = self.$el.find('.dashboard-canvas .boatday-overview-booking-requests');
				target.html('');

				var pricePerSeat = boatday.get('price');
				var bookedSeats = boatday.get("bookedSeats");
				var earnings = pricePerSeat * bookedSeats;

				var baseRate = self.getHostRate(Parse.User.current().get('host').get('type'));

				var totalPriceUSD = pricePerSeat * bookedSeats;
				var totalBoatDayUSD = baseRate * totalPriceUSD;
				var totalPartnerDiscountPercent = baseRate - Parse.User.current().get('host').get('rate');
				var totalPartnerDiscount = totalPartnerDiscountPercent * totalPriceUSD;
				var totalHostUSD = totalPriceUSD - (totalBoatDayUSD - totalPartnerDiscount);
				
				var _tpl = tpl({
					pendingRequests: self.collectionPendingSeatRequests,
					approvedRequests: self.collectionApprovedSeatRequests,
					cancelledRequests: self.collectionCancelledSeatRequests,
					rejectedRequests: self.collectionRejectedSeatRequests,
					pricePerSeat: pricePerSeat,
					bookedSeats: bookedSeats,
					earnings: totalHostUSD,
					self: self,
					boatday: boatday
				});

				target.append(_tpl);

				if( self.isPastBoatDay ) {
					
					self.displayNewBookingCount(self.collectionNoHostYesGuestReviews.length + self.collectionYesHostYesGuestReviews.length);

					console.log("No Host No Guest: " + self.collectionNoHostNoGuestReviews.length);
					console.log("No Host Yes Guest: " + self.collectionNoHostYesGuestReviews.length);
					console.log("Yes Host No Guest: " + self.collectionYesHostNoGuestReviews.length);
					console.log("Yes Host Yes Guest: " + self.collectionYesHostYesGuestReviews.length);

					var num = 	self.collectionNoHostNoGuestReviews.length + 
								self.collectionNoHostYesGuestReviews.length + 
								self.collectionYesHostNoGuestReviews.length + 
								self.collectionYesHostYesGuestReviews.length;

					if( num > 0 ){
						console.log("Total num "+ num);

						self.$el.find('.review-list').show();
						self.$el.find('.review-list').append(_.template(BoatDayOverviewRatingRowTemplate)({self: self}));
					}
				
				}

				else{

					if((self.collectionPendingSeatRequests.length + self.collectionPendingGuestRequests.length) > 0){
						self.$el.find('.pending-list').show();

						self.displayNewBookingCount(self.collectionPendingSeatRequests.length + self.collectionPendingGuestRequests.length);
					}

					var requestArray = self.collectionPendingSeatRequests.concat(self.collectionPendingGuestRequests);

					_.each(requestArray, function(request){

							var pricePerSeat = boatday.get('price');
							var numOfSeats = request.get("seats");

							var baseRate = self.getHostRate(Parse.User.current().get('host').get('type'));

							var totalPriceUSD = pricePerSeat * numOfSeats;
							var totalBoatDayUSD = baseRate * totalPriceUSD;
							var totalPartnerDiscountPercent = baseRate - Parse.User.current().get('host').get('rate');
							var totalPartnerDiscount = totalPartnerDiscountPercent * totalPriceUSD;
							var totalHostUSD = totalPriceUSD - (totalBoatDayUSD - totalPartnerDiscount);


							var data = {
								request: request,
								status: request.get("status"),
								totalHostUSD: totalHostUSD
							};

							self.$el.find('.pending-list').append(_.template(BoatDayOverviewBoookingRowTemplate)(data));
					});

				}

			},

			displayNewBookingCount: function( count){

				var self = this;

				var target = this.$el.find('.boatday-overview-booking-requests .new-booking-count');

				var infoPendingCountTarget = this.$el.find('.boatday-overview .overviewinfo-right .info-new-pending');
				var infoPendingLinkTarget = this.$el.find('.boatday-overview .overviewinfo-right .info-pending-link');

				var infoReviewCountTarget = this.$el.find('.boatday-overview .overviewinfo-right .info-new-review');
				var infoReviewLinkTarget = this.$el.find('.boatday-overview .overviewinfo-right .info-review-link');

				var pl = (count == 1) ? '' : 's';

				if( self.isPastBoatDay ){

					if( count > 0 ){
						target.html(' - <font color="#f8b62c"> new review</font>');
					}
					
					infoReviewCountTarget.html(count);
					infoReviewLinkTarget.html( 'New </br> Review' + pl );

				} else {

					if( count > 0 ){
						target.html(' - <font color="#f8b62c"> new request</font>');
					}

					infoPendingCountTarget.html(count);
					infoPendingLinkTarget.html( 'Pending Request' + pl );
				}
				
			},

			approveRequest: function(event) {

				event.preventDefault();

				var self = this;

				if( typeof Parse.User.current().get('host').get('stripeId') === typeof undefined || !Parse.User.current().get('host').get('stripeId') ) {
					
					this.modal({
						title: 'How you get paid!',
						body: 'To confirm Guests on-board your BoatDay, you must first provide a payment account (its how Guests pay you!)<br/><br/>Don’t worry, this information is NEVER shared with other Users.',
						noButton: false,
						cancelButton: false,
						closeButton: true,
						yesButtonText: 'Add Payment Account',
						yesCb: function() {
							Parse.history.navigate('my-bank-account?redirect=boatday-overview/' + self.model.id + "?show=request", true);
						}
					});

					return;
				}		

				var request = self.collectionSeatRequests[$(event.currentTarget).attr("data-id")];

				self.buttonLoader('...', $(event.currentTarget));

				request.save({ status: 'approved' }).then(function() {
	
				request.get('boatday').increment('bookedSeats', request.get('seats'));
					request.get('boatday').save().then(function() {
						
						new NotificationModel().save({
							action: 'request-approved',
							fromTeam: false,
							message: null,
							to: request.get('profile'),
							from:  Parse.User.current().get('profile'),
							boatday: request.get('boatday'),
							sendEmail: false,
							request: request
						}).then(function() {

							self.model.fetch().then(function(object) {
								self.buttonLoader();
								self.model = object;
								self.render();
							});
							
						});
					});
				});

			},	

			denyRequest: function(event) {

				event.preventDefault();

				var self = this;

				if( typeof Parse.User.current().get('host').get('stripeId') === typeof undefined || !Parse.User.current().get('host').get('stripeId') ) {
					
					this.modal({
						title: 'How you get paid!',
						body: 'To reject Guests on-board your BoatDay, you must first provide a payment account (its how Guests pay you!)<br/><br/>Don’t worry, this information is NEVER shared with other Users.',
						noButton: false,
						cancelButton: false,
						closeButton: true,
						yesButtonText: 'Add Payment Account',
						yesCb: function() {
							Parse.history.navigate('my-bank-account?redirect=boatday-overview/' + self.model.id + "?show=request", true);
						}
					});

					return;
				}
				
				var request = self.collectionSeatRequests[$(event.currentTarget).attr("data-id")];

				self.buttonLoader('...', $(event.currentTarget));

				request.save({ status: 'denied' }).then(function() {

					new NotificationModel().save({
						action: 'request-denied',
						fromTeam: false,
						message: null,
						to: request.get('profile'),
						from:  Parse.User.current().get('profile'),
						boatday: request.get('boatday'),
						sendEmail: false,
						request: request
					}).then(function() {
						
						self.model.fetch().then(function(object){
							self.buttonLoader();
							self.model = object;
							self.render();
						});

					});

				});

			},

			rateOver: function(event) {
				var self = this;
				var e = $(event.currentTarget);

				var requestId = e.attr('data-id');
				
				self.$el.find('.rate-btn-' + requestId).attr("data-rating", 0);
				
				$('.stars .rate').each(function( index ){
					self.$el.find('.rate-img-'+ index + '-' + requestId).attr('src', 'resources/star.png');
				});

				e.attr('src', 'resources/star-full.png');				
				e.prevAll().attr('src', 'resources/star-full.png');				

			},

			rateOut: function(event) {
				var self = this;
				var e = $(event.currentTarget);

				var requestId = e.attr('data-id');
				
				var rateBtn = self.$el.find('.rate-btn-' + requestId);

				e.attr('src', 'resources/star.png');
				e.prevAll().attr('src', 'resources/star.png');

				for(var i = 1; i <= rateBtn.attr("data-rating"); i++){
					self.$el.find('.rate-img-'+ i + '-' + requestId).attr('src', 'resources/star-full.png');
				}

			},

			rate: function( event ){
				var self = this;
				var e = $(event.currentTarget);

				var requestId = e.attr('data-id');

				self.$el.find('.rate-btn-' + requestId).attr("data-rating", e.attr('data-rate'));	

			},

			submitRating: function( event ){
				var self = this;
				var e = $(event.currentTarget);
				//var rating = e.attr("data-rating");

				if( e.attr("data-rating") < 1 ) { return; }

				var requestId = e.attr('data-id');
				var boatdayId = this.model.id;

				self.buttonLoader("Saving...", e);
				

				self.collectionSeatRequests[requestId].save({ ratingHost: parseInt(e.attr("data-rating")) }).then(function(request) {

					var profile = self.collectionSeatRequests[requestId].get('profile');
					var rating = typeof profile.get('rating') != typeof undefined && profile.get('rating') ? profile.get('rating') : 0;
					var ratingAmount = profile.get('ratingAmount');

					profile.save({
						rating : ( rating * ratingAmount  + parseInt(e.attr("data-rating")) ) / (ratingAmount + 1),
						ratingAmount: ratingAmount + 1
					});

					new NotificationModel().save({
						action: 'boatday-rating',
						fromTeam: false,
						message: null,
						to: request.get('profile'),
						from:  Parse.User.current().get('profisaccele'),
						boatday: request.get('boatday'),
						sendEmail: false,
						request: request
					}).then(function() {
						self.refreshReviews();
						console.log("request id :" + requestId + " ratingHost " + rating);
					});

				}, function(error) {
					console.log(error);
					self.buttonLoader();
				});
			
			},

			refreshReviews: function(){
				var self = this;
				var qSeatRequest = new Parse.Query(Parse.Object.extend("SeatRequest"));
				qSeatRequest.equalTo("boatday", this.model);
				qSeatRequest.include('profile.user');
				qSeatRequest.include('boatday');
				qSeatRequest.descending("updatedAt");

				qSeatRequest.find().then(function(seatRequests){

					//Reset Host review collection
					self.collectionNoHostYesGuestReviews = [];
					self.collectionNoHostNoGuestReviews = [];
					self.collectionYesHostYesGuestReviews = [];
					self.collectionYesHostNoGuestReviews = [];

					_.each(seatRequests, function(request){

						if(request.get('status') == "approved"){

							var rateByGuest = request.get("ratingGuest") != null ? request.get("ratingGuest") : 0;
							var rateByHost = request.get("ratingHost") != null ? request.get("ratingHost") : 0;

							if((rateByGuest + rateByHost) < 1){ //no host no guest
								self.collectionNoHostNoGuestReviews.push(request);
							}
							else if ( (rateByHost < 1) && (rateByGuest > 0) ){ //no host yes guest
								self.collectionNoHostYesGuestReviews.push(request);
							}
							else if( (rateByHost > 0) && (rateByGuest < 1)){ //yes host no guest
								self.collectionYesHostNoGuestReviews.push(request);
							}
							else if ( (rateByHost > 0) && (rateByGuest > 0) ){ //yes host yest guest
								self.collectionYesHostYesGuestReviews.push(request);
							}
						}

					});

					var num = 	self.collectionNoHostNoGuestReviews.length + 
								self.collectionNoHostYesGuestReviews.length + 
								self.collectionYesHostNoGuestReviews.length + 
								self.collectionYesHostYesGuestReviews.length;

					if( num > 0 ){

						self.$el.find('.review-list').html("");
						self.$el.find('.review-list').append(_.template(BoatDayOverviewRatingRowTemplate)({self: self}));
					}

				});
			
			},

			renderQuestions: function(){

				var self = this;

				var boatday = this.model;

				var infoMessage = "";

				if(self.isPastBoatDay){
					infoMessage = "This BoatDay is over, the questions are now deactivated.";
				}

				if(boatday.get("status") == "cancelled"){
					infoMessage = "This BoatDay was cancelled, the questions are now deactivated";
				}

				var tpl = _.template(BoatDayOverviewQuestionsTemplate);
				var target = self.$el.find('.dashboard-canvas .boatday-overview-questions');
				target.html('');
					
				var _tpl = tpl({
					toatalQuestions: (self.collectionUnAnsweredQuestions.length + self.collectionAnsweredQuestions.length),
					unAnsweredQuestions: self.collectionUnAnsweredQuestions,
					boatday: boatday,
					self: self,
					infoMessage: infoMessage
				});

				target.append(_tpl);

				self.loadQuestions();

			},

			loadQuestions: function(){
				var self = this;

				self.displayNewQuestionCount(self.collectionUnAnsweredQuestions.length);

				_.each(self.collectionUnAnsweredQuestions, function(question){

					var questionDateTimeStr = "";
					var createdAt = new Date(question.createdAt);
					questionDateTimeStr = self.getShortenDayname(createdAt) + " " + (createdAt.getMonth() + 1) + "/" + createdAt.getDate() + " at " + self.formatAmPm(createdAt) + ".";

					var data = {
						question: question,
						questionDateTimeStr: questionDateTimeStr,
						from: question.get("from"),
						boatday: question.get("boatday"),
						profile: Parse.User.current().get('profile'),
						self: self
					};
						
					self.$el.find('.new-question-list').append(_.template(BoatDayNewQuestionRowTemplate)(data));

				});

				_.each(self.collectionAnsweredQuestions, function(question){

					var questionDateTimeStr = "";
					var createdAt = new Date(question.createdAt);

					questionDateTimeStr = self.getShortenDayname(createdAt) + " " + (createdAt.getMonth() + 1) + "/" + createdAt.getDate() + " at " + self.formatAmPm(createdAt) + ".";

					var data = {
						questionDateTimeStr: questionDateTimeStr,
						question: question,
						from: question.get("from"),
						boatday: question.get("boatday"),
						profile: Parse.User.current().get('profile')
					};

					self.$el.find('.old-question-list').append(_.template(BoatDayOldQuestionRowTemplate)(data));
				});

			},

			submitAnswer: function(event){

				event.preventDefault();

				var self = this;

				self.cleanForm();
				self.buttonLoader("Saving...", $(event.currentTarget));

				var id = $(event.currentTarget).closest(".boatday-question-form").attr("data-id");

				var answer = $(event.currentTarget).closest('.boatday-question-form').find('[name="answer-'+id+'"]').val();
				var makePublic = Boolean($(event.currentTarget).closest(".boatday-question-form").find('[name="makePublic-'+id+'"]').is(':checked'));

				if(answer.length == 0){
					
					self.fieldError('answer-'+id, "Oops, you missed one! Please write your answer.");
					
					self.buttonLoader();

					return;
				}

				var question = self.collectionQuestions[id];

				question.save({"answer": answer, "public" : makePublic}).then(function(){

					new NotificationModel().save({
						action: 'boatday-answer',
						fromTeam: false,
						boatday: self.model,
						message: null,
						to: question.get('from'),
						from:  Parse.User.current().get('profile'),
						boatday: question.get('boatday'),
						sendEmail: false
					}).then(function(){
						self.refreshQuestions();
					});
				});

			},

			refreshQuestions: function(){

				var self = this;
				var Question = Parse.Object.extend("Question");
				var qQuestion = new Parse.Query(Question);
				qQuestion.equalTo("boatday", this.model);
				qQuestion.include("boatday");
				qQuestion.include("from");
				qQuestion.descending("updatedAt");

				qQuestion.find().then(function(questions){
					
					self.collectionUnAnsweredQuestions = [];
					self.collectionAnsweredQuestions = [];

					_.each(questions, function(question){

						self.collectionQuestions[question.id] = question;
							
						if((question.get("answer") == null) || question.get("answer") == ""){
							self.collectionUnAnsweredQuestions.push(question);
						}else{
							self.collectionAnsweredQuestions.push(question);
						}
					});

					self.renderQuestions();

					self.$el.find('.boatday-question').show();
				});

			},

			getShortenDayname: function(date){
				var daysName = ["Sun.","Mon.","Tue.","Wed.","Thu.","Fri.","Sat."];
				return daysName[date.getDay()];

			},

			formatAmPm: function(date){
				var hours = date.getHours();
				var minutes = date.getMinutes();
				var ampm = hours >= 12 ? 'pm' : 'am';
				hours = hours % 12;
				hours = hours ? hours : 12;
				minutes = minutes < 10 ? '0'+minutes : minutes;

				return (hours + ":" + minutes + " " + ampm);

			},

			renderCancelBoatDay: function(){
				var self = this;

				var tpl = _.template(BoatDayOverviewCancelTemplate);
				var target = self.$el.find('.dashboard-canvas .boatday-overview-cancel-boatday');
				target.html('');

				var showCancelBtn = true;

				if((this.model.get("status") == "cancelled") || (self.isPastBoatDay)){
					showCancelBtn = false;
				}

				var _tpl = tpl({
					showCancelBtn: showCancelBtn
				});

				target.append(_tpl);
			
			},				

			renderRescheduleBoatDay: function(){
				
				var self = this;

				var tpl = _.template(BoatDayOverviewRescheduleTemplate);
				var target = self.$el.find('.dashboard-canvas .boatday-overview-reschedule');
				target.html('');

				var _tpl = tpl({

				});

				target.append(_tpl);

			},

			processReadOnly: function(event){
				event.preventDefault();
				this.$el.find('.boatday-read-only').toggle();

			},

			processBoatDayEdit: function(event){

				var self = this;
				
				event.preventDefault();

				var visibility = this.$el.find('.boatday-edit-form').css('visibility');

				if(visibility == 'hidden'){
					this.$el.find('.boatday-edit-form').css({height: 'auto', visibility: 'visible'});
					self.centerMapInStart();
				}
				else{
					this.$el.find('.boatday-edit-form').css({height: '0px', visibility: 'hidden'});
				}				

			},

			processBoatDayGroupChat: function(event){

				event.preventDefault();
				this.$el.find('.boatday-group-chat-form').toggle();
				this._scrollDown(this.model.id);
				this.saveLastReading(this.model);

			},

			processOpenChatRow: function(event){

				event.preventDefault();
				var target = this.$el.find('.boatday-group-chat-form');
				target.show();

				var elem = this.$el.find('.boatday-overview-group-chat');
				var main = this.$el.find('.inner-content');
		        
		        this.scrollToTarget(main, elem);

		        this.saveLastReading(this.model);

			},

			processOpenReviewRow: function(event){
				event.preventDefault();

				var target = this.$el.find('.boatday-booking-requests');
				target.show();
				
				$(".boatday-booking-requests .nav-pills li").each(function (index){
					if($(this).hasClass("active")){
						$(this).removeClass("active");
					}
				});

				$(".boatday-booking-requests .tab-content .tab-pane").each(function (index){
					if($(this).hasClass("active")){
						$(this).removeClass("active");
					}
				});

				var toggleBtn = this.$el.find('.rejected-guest-tgl');
				toggleBtn.addClass("active");

				var toggleContent = this.$el.find('#rejected-guests-tab');
				toggleContent.addClass("active");

				var elem = this.$el.find('.boatday-overview-booking-requests');
				var main = this.$el.find('.inner-content');
		        
		        this.scrollToTarget(main, elem); 

			},

			processBookingRequests: function(event){

				event.preventDefault();
				this.$el.find('.boatday-booking-requests').toggle();

			},

			processOpenBookingRow: function(event){
				event.preventDefault();
				var target = this.$el.find('.boatday-booking-requests');
				target.show();

				$(".boatday-booking-requests .nav-pills li").each(function (index){
					if($(this).hasClass("active")){
						$(this).removeClass("active");
					}
				});

				$(".boatday-booking-requests .tab-content .tab-pane").each(function (index){
					if($(this).hasClass("active")){
						$(this).removeClass("active");
					}
				});

				var toggleBtn = this.$el.find('.attending-guest-tgl');
				toggleBtn.addClass("active");

				var toggleContent = this.$el.find('#attending-guest-tab');
				toggleContent.addClass("active");

				var elem = this.$el.find('.boatday-overview-booking-requests');
				var main = this.$el.find('.inner-content');
		        
		        this.scrollToTarget(main, elem);   
				
			},

			processQuestions: function(event){

				event.preventDefault();
				this.$el.find('.boatday-question').toggle();

			},

			processOpenQuestionRow: function(event){
				event.preventDefault();
				var target = this.$el.find('.boatday-question');
				target.show();

				var elem = this.$el.find('.boatday-overview-questions');
				var main = this.$el.find('.inner-content');

				this.scrollToTarget(main, elem);
				
			},

			scrollToTarget:function(main, elem){
				
				if(elem) {
		           
		           var t = main.offset().top;

		           main.animate( { scrollTop: elem.position().top }, 1000);
				
				}
			
			},

			cancelBoatDay: function(event) {
				
				event.preventDefault();

				var self = this;

				var cb = function(modal) {

					var field = modal.find('[name="cancelReason"]');
					var cancelReason = field.val();
					
					var btn = modal.find('.btn-yes');

					btn.html("Cancelling...");

					self.submitCancelBoatDay(cancelReason);
				};

				var modalValidation = function(modal){

					var field = modal.find('[name="cancelReason"]');
					var cancelReason = field.val();
					var errorField = modal.find('.display-messages');
					
					if((cancelReason.trim()).length < 1){

						field.closest('.form-group').addClass("has-error");
						field.val("");
						errorField.html("Let Guests know why you have to cancel.");

						return false;
					}

					else{

						return true;
					}
				};

				var modalBody = '<div class="form-group">'+
									'<label class="control-label" for="cancelReason">Reason</label>'+
									'<textarea name="cancelReason" class="form-control" rows="5" placeholder="Cancellations negatively affect user’s BoatDay experience and may lead to poor reviews from your Guests.  Be sure to tell Guests the reason for your cancellation."></textarea>'+
								'</div>'+
								'<div class="display-messages text-center"></div>';


				this.modal({
					title: 'Cancel Boatday: ' + self.model.get("name"),
					body: modalBody,
					noButton: false,
					closeButton: true,
					cancelButton: true,
					cancelButtonText: "Go Back",
					yesButtonText: "Cancel BoatDay",
					yesCb: cb,
					yesCbValidation: modalValidation
				});

			},

			submitCancelBoatDay: function(cancelReason){
				var self = this;
					
				var boatday = this.model;

				boatday.save({status: 'cancelled', cancelReason: cancelReason }).then(function(boatday) {

					boatday.relation('seatRequests').query().find().then(function(requests) {

						_.each(requests, function(request) {

							// Cancel boatday for each participant
							new NotificationModel().save({
								action: 'boatday-cancelled',
								fromTeam: false,
								message: null,
								to: request.get('profile'),
								from:  Parse.User.current().get('profile'),
								boatday: boatday,
								sendEmail: false,
								request: request
							}).then(function() {
								request.save({ status: 'cancelled-host' }).then(function() {
									self.buttonLoader();
									self.render();
									self._info('Your BoatDay ' + boatday.get('name') + ' is now cancelled.');
								});
							});
							
						});

						Parse.history.navigate('#dashboard', true);
					})
				});

			},

			rescheduleBoatDay: function(event){
				
				event.preventDefault();

				var boatday = this.model;

				var self = this;

				var cb = function(modal) {

					var date = modal.find('[name="date"]').datepicker('getDate');
					var rescheduleReason = modal.find('[name="rescheduleReason"]').val();
					var rescheduleReasonShort = modal.find('[name="rescheduleReasonShort"]').val();

					self.submitRescheduleBoatDay(date, rescheduleReason, rescheduleReasonShort);

				};

				var modalValidation = function(modal){

					var self = this;

					var dateField = modal.find('[name="date"]');
					var inputDate =  modal.find('[name="date"]').datepicker('getDate');
					var errorField = modal.find('.display-messages');
					var rescheduleReasonField = modal.find('[name="rescheduleReason"]');
					var rescheduleReason = rescheduleReasonField.val();

					var err = "";
					
					if( !inputDate ) {
						
						dateField.closest('.form-group').addClass("has-error");
						dateField.val("");
						err = "Please choose a date for your BoatDay."

					} else{
						dateField.closest('.form-group').removeClass("has-error");
					}

					if ((rescheduleReason.trim()).length < 1) {

						rescheduleReasonField.closest('.form-group').addClass('has-error');
						rescheduleReasonField.val("");
						err = "Please let Guests know why you have to reschedule.";
						
					} else {
						rescheduleReasonField.closest('.form-group').removeClass('has-error');
					}

					if(err.length > 1){

						errorField.html(err);
							
						return false;
						
					} else{
							
						return true;
					}
					

				};


				var modalBody = '<div class="form-group">'+
									'<label class="control-label" for="date">New Departure Date</label>'+
									'<input type="text" class="form-control reschedule-boatday-date select-styles" placeholder="mm/dd/yyyy" id="date" name="date" />'+
								'</div>'+
								'<div class="form-group">'+
									'<label class="control-label" for="date">Reason</label>'+
									'<select class="form-control reschedule-boatday-reason-short select-styles" name="rescheduleReasonShort">'+
										'<option value="weather">Weather</option>'+
										'<option value="maintenance">Boat Maintenance</option>'+
										'<option value="personal">Personal Emergency</option>'+
									'</select>'+
								'</div>'+
								'<div class="form-group">'+
									'<label class="control-label" for="rescheduleReason">Message to Confirmed Guests</label>'+
									'<textarea name="rescheduleReason" class="form-control" rows="5" placeholder="Rescheduling can be inconvenient for confirmed Guests, so be sure to leave a message explaining the details. Don’t forget . . . Guests can cancel without penalty for a rescheduled BoatDay."></textarea>'+
								'</div>'+
								'<div class="display-messages text-center"></div>';


				this.modal({
					title: 'Reschedule Boatday: ' + self.model.get("name") + "?",
					body: modalBody,
					noButton: false,
					closeButton: true,
					cancelButton: true,
					cancelButtonText: "Go Back",
					yesButtonText: "Reschedule BoatDay",
					yesCb: cb,
					yesCbValidation: modalValidation
				});
				
				

				$('.reschedule-boatday-date').datepicker({
					startDate: '+1d',
					autoclose: true,
					orientation: "top"
				});
				$('.reschedule-boatday-date').datepicker('setDate', this.model.get('date'));

			},

			submitRescheduleBoatDay:function(newDate, rescheduleReason, rescheduleReasonShort){
				
				var self = this;
				var boatday = this.model;

				var data = {
					date: newDate,
					rescheduleReason: rescheduleReason,
					bookedSeats: 0,
					rescheduleReasonShort: rescheduleReasonShort
				};

				var qBoatDay = new Parse.Query(BoatDayModel);
				qBoatDay.equalTo("boat", boatday.get("boat"));
				qBoatDay.equalTo("date", newDate);
				qBoatDay.notEqualTo('objectId', boatday.id);
				qBoatDay.greaterThan("arrivalTime", boatday.get("departureTime"));
				qBoatDay.lessThan("departureTime", boatday.get("arrivalTime"));

				var qCaptain = new Parse.Query(BoatDayModel);
				qCaptain.equalTo("captain",boatday.get("captain"));
				qCaptain.equalTo("date", newDate);
				qCaptain.notEqualTo('objectId', boatday.id);
				qCaptain.greaterThan("arrivalTime", boatday.get("departureTime"));
				qCaptain.lessThan("departureTime", boatday.get("arrivalTime"));


				Parse.Promise.when(qBoatDay.count(), qCaptain.count()).then(function(qBoatDayTotal, qCaptainTotal) {

					if(qBoatDayTotal > 0){

						var modalBody = '<p class="text-center">Scheduling Conflict: The boat you selected is already scheduled for a BoatDay at your proposed time.</p>';

						self.modal({
							title: 'Reschedule error: ' + self.model.get("name"),
							body: modalBody,
							noButton: false,
							closeButton: true,
							cancelButton: true,
							cancelButtonText: "Cancel",
							yesButton: false
						});

						return;
					}

					if(qCaptainTotal > 0){
						
						var modalBody = '<p class="text-center">Scheduling Conflict: The captian you selected is already scheduled for a BoatDay at your proposed time.</p>';

						self.modal({
							title: 'Reschedule error: ' + self.model.get("name"),
							body: modalBody,
							noButton: false,
							closeButton: true,
							cancelButton: true,
							cancelButtonText: "Cancel",
							yesButton: false
						});
						
						return;
					}

					boatday.save(data).then(function(boatday) {

						var promises = [];

						//pending-guest for all pending and approved
						_.each(self.collectionSeatRequests, function(request){
								
								if((request.get("status") == "pending") || (request.get("status") == "approved")){
									
									var notify = new NotificationModel();
									var data = {
										action: 'boatday-reschedule',
										fromTeam: false,
										message: rescheduleReason,
										to: request.get('profile'),
										from:  Parse.User.current().get('profile'),
										boatday: boatday,
										sendEmail: false,
										request: request
									};

									promises.push(notify.save(data).then(function(){
										request.save({status: 'pending-guest'});
									}));
								}

						});

						Parse.Promise.when(promises).then(function(){
							self.render();
						});

					});

				});

			},

			updateBoatDay: function(event){
				event.preventDefault();

				var self = this;
				self.cleanForm();
				self.buttonLoader('Saving');

				if( !this._in('date').datepicker('getDate') ) {
					self.fieldError("date", "Oops, you missed one! Please choose a date for your BoatDay.");
					self._error("Oops, you missed one! Please choose a date for your BoatDay.");
					self.buttonLoader();
					return;
				}

				var date = this._in('date').datepicker('getDate');
				var departureTime = this._in('departureTime').slider('getValue');
				var arrivalTime = this._in('departureTime').slider('getValue') + self._in('duration').slider('getValue');

				var boatAlreadyBooked = function() {
					var msg = 'Scheduling Conflict: The boat you selected is already scheduled for a BoatDay at your proposed time.';
					self._error(msg);
					self.fieldError("boat", msg);
				};

				var captainAlreadyBooked = function() {
					var msg = 'Scheduling Conflict: The Captain you selected is already scheduled for a BoatDay at your proposed time.';
					self._error(msg);
					self.fieldError("captain", msg);
				};

				var qBoatDay = new Parse.Query(BoatDayModel);
				qBoatDay.equalTo("boat", self.collectionBoats[this._in('boat').val()]);
				qBoatDay.equalTo("date", date);
				qBoatDay.notEqualTo('objectId', this.model.id);
				qBoatDay.greaterThan("arrivalTime", departureTime);
				qBoatDay.lessThan("departureTime", arrivalTime);

				var qCaptain = new Parse.Query(BoatDayModel);
				qCaptain.equalTo("captain", self.collectionCaptains[this._in('captain').val()]);
				qCaptain.equalTo("date", date);
				qCaptain.notEqualTo('objectId', this.model.id);
				qCaptain.greaterThan("arrivalTime", departureTime);
				qCaptain.lessThan("departureTime", arrivalTime);

				Parse.Promise.when(qBoatDay.count(), qCaptain.count()).then(function(qBoatDayTotal, qCaptainTotal) {
					
					var err = false;

					if( qBoatDayTotal > 0 ) {
						boatAlreadyBooked();
						err = true;
					}

					if( qCaptainTotal > 0 ) {
						captainAlreadyBooked();
						err = true;
					}

					if ( err ) {
						self.buttonLoader();
						return;
					}

					self.save();
				});

			},

			save: function(event) {

				var self = this;
				var baseStatus = this.model.get('status');

				var data = {
					status: 'complete',
					boat: self.collectionBoats ? self.collectionBoats[this._in('boat').val()] : null,
					captain: self.collectionCaptains ? self.collectionCaptains[this._in('captain').val()] : null,
					name: this._in('name').val(),
					description: this._in('description').val(),
					date: this._in('date').datepicker('getDate'),
					departureTime: this._in('departureTime').slider('getValue'),
					arrivalTime: this._in('departureTime').slider('getValue') + self._in('duration').slider('getValue'),
					duration: self._in('duration').slider('getValue'),
					location: self._marker ? new Parse.GeoPoint({latitude: self._marker.getPosition().lat(), longitude: self._marker.getPosition().lng()}) : null,
					locationText: this._in('locationText').val(),
					availableSeats: self._in('availableSeats').slider('getValue'),
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
							Parse.history.navigate('dashboard', true);
							self._info('BoatDay Created! Once you are approved as a Host, all of your BoatDays will automatically appear in the BoatDay App.');
						};

						var host = Parse.User.current().get("host");
						host.relation('boatdays').add(boatday);
						host.save().then(hostSaveSuccess);

					} else {
						
						self.$el.find('.boatday-edit-form').hide();
						self.render();

					}

				};

				var saveError = function(error) {
					self.handleSaveErrors(error);
				};

				self.model.save(data).then(saveSuccess, saveError);

			},

			boatSelected: function(event){
				//console.log("Boat selected");
				var self = this;
				var boat = self.collectionBoats[$(event.currentTarget).val()];

				//Update max capacity
				var _max = Math.min(15, boat.get('capacity'));
				//var _current = self._in('availableSeats').slider('getValue');

				//Get Captains
				self.collectionCaptains = {};
				self.collectionCaptains[Parse.User.current().get('profile').id] = Parse.User.current().get('profile');

				var queryCaptains = boat.relation('captains').query();
				queryCaptains.equalTo('status', 'approved');
				queryCaptains.include('captainProfile');
				queryCaptains.each(function(captainRequest) {

					if(captainRequest.get('captainProfile')) {
						self.collectionCaptains[captainRequest.get('captainProfile').id] = captainRequest.get('captainProfile')
					}

				}).then(function() {

					if(self.isReadOnly){
						var select = $('<select>').attr({ id: 'captain', name: 'captain', class: 'form-control', disabled:'disabled' });
					}
					else{
						var select = $('<select>').attr({ id: 'captain', name: 'captain', class: 'form-control' });
					}

					

					_.each(self.collectionCaptains, function(captain) {
						var opt = $('<option>').attr('value', captain.id).text(captain.get('displayName'));
						select.append(opt);
						self.collectionCaptains[captain.id] = captain;
					});
					
					self.$el.find('.captains').html(select);
					select.change();
				});

			},

			fetchChat: function(boatday) {

				console.log("Fetch chat");

				var self = this;

				var q = boatday.relation('chatMessages').query();
				q.equalTo('status', 'approved');
				q.ascending('createdAt');
				q.include('profile');

				if( self.chatLastFetch ) {
					query.greaterThan('createdAt', self.chatLastMessage.createdAt);
				}

				q.find().then(function(messages) {
					
					if( messages.length == 0 ) {

						self.$el.find('.dashboard-canvas .boatday-overview-group-chat .boatday-group-chat-form .box-messages .info .inner').html('<p class="empty"><em>Use this message board to chat directly with your confirmed Guests, we recommend starting with a welcome message to say hello.</em></p>');
						
						return ;
					}

					self.$el.find('.dashboard-canvas .boatday-overview-group-chat .boatday-group-chat-form .box-messages .info .inner').html('');
					self.$el.find('.dashboard-canvas .boatday-overview-group-chat .boatday-group-chat-form .box-messages .bottom').show();

					var unread = 0;	

					_.each(messages, function(message) {

						if( boatday.get('host').id == Parse.User.current().get('host').id ) {
							if( boatday.get('hostLastRead') < new Date(message.createdAt) ) {
								unread++;
							}
						} else if( boatday.get('captain').id == Parse.User.current().get('profile').id ) {
							if( boatday.get('captainLastRead') < new Date(message.createdAt) ) {
								unread++;
							}
						}

						self.appendMessage(boatday.id, message);
					});

					self.displayNewChatCount(unread);

					self._scrollDown(boatday.id);
					
				}, function(error){
					console.log(error);
				});

			},

			submitChat: function(event){

				event.preventDefault();

				var self = this;
			
				var boatday = self.model;
				var msg = this._in('message').val();

				if( msg == '' ) {
					return;
				}

				this._in('message').val('');
				var textarea = document.getElementById("auto-expand-textarea");
				var sendBtn = self.$el.find('.dashboard-canvas .boatday-overview-group-chat .enter-chat-text');
				textarea.style.height = "";
				sendBtn.removeClass("hovered");
				
				new ChatMessageModel({
					message: msg,
					boatday: boatday,
					profile: Parse.User.current().get('profile'),
					addToBoatDay: true
				}).save().then(function(message) {
					self.appendMessage(boatday.id, message);
					self._scrollDown(boatday.id);
					self.saveLastReading(boatday);

				}, function(error) {
					console.log(error);
				});

			},

			addMessage: function(event) {

				event.preventDefault();

				var self = this;
				var target = $(event.currentTarget);
				var boatday = self.model;
				var msg = target.val();

				if( msg == '' ) {
					return;
				}

				target.val('');

				new ChatMessageModel({
					message: msg,
					boatday: boatday,
					profile: Parse.User.current().get('profile'),
					addToBoatDay: true
				}).save().then(function(message) {
					self.appendMessage(boatday.id, message);
					self._scrollDown(boatday.id);
					self.saveLastReading(boatday);
				}, function(error) {
					console.log(error);
				});

			},
			
			appendMessage: function(boatdayId, message) {

				var self = this;
				var tpl = _.template(BoatDayOverviewChatMessageTemplate);

				var msg = message.get("message");

				self.$el.find('.dashboard-canvas .boatday-overview-group-chat .boatday-group-chat-form .box-messages .info .inner .empty').remove();

				var _tpl = tpl({
					profile: message.get('profile'),
					message: message,
					self: self
				});

				self.$el.find('.dashboard-canvas .boatday-overview-group-chat .boatday-group-chat-form .box-messages .info > .inner').append(_tpl);

				self.chatLastMessage = message;

			},

			_scrollDown: function(boatdayId) {

				var item = this.$el.find('.boatday-group-chat-form .box-messages .info');
				item.scrollTop(item.prop('scrollHeight'));

			},

			saveLastReading: function(boatday) {
				
				var self = this;
				if( boatday.get('host').id == Parse.User.current().get('host').id ) {
					boatday.save({ hostLastRead: new Date() }).then(function() {
					self.displayNewChatCount(0);
					});
				} else if( boatday.get('captain').id == Parse.User.current().get('profile').id ) {
					boatday.save({ captainLastRead: new Date() }).then(function() {
					self.displayNewChatCount(0);
					});
				}

			},

			duplicate: function(event) {
				event.preventDefault();

				var baseBoatDay = this.model;

				var self = this;

				self.buttonLoader("Creating...", $(event.currentTarget));

				baseBoatDay.relation('boatdayPictures').query().find().then(function(bdPictures){
					
					baseBoatDay.clone().save({
						status:'creation',
						duplicateFrom: baseBoatDay,
						duplicateSource: typeof baseBoatDay.get('duplicateSource') === typeof undefined ? baseBoatDay : baseBoatDay.get('duplicateSource'),
						date: null
					}).then(function(newBoatDay){

						console.log("clone created");
						
						_.each(bdPictures, function(bdPicture){
							newBoatDay.relation('boatdayPictures').add(bdPicture);
						});

						newBoatDay.save().then(function(bd){
							console.log("new boatday save success");
							Parse.history.navigate('boatday/'+bd.id, true);
							
						}, function(error){
							console.log(error);
							self.buttonLoader();
						});

					}, function(error){
						console.log(error);
						self.buttonLoader();
					});
				});


			},

			displayBoatDayPictures: function() {
				
				var self = this;

				var sliderThumbsTarget = self.$el.find('.boatday-pic-slider .boatday-pic-thumbs img');
				sliderThumbsTarget.not(':last').remove();

				self.boatdayPictures = {};
				self.boatdayPics = [];

				var query = self.model.relation('boatdayPictures').query();
				query.ascending("order");
				query.find().then(function(matches) {

					_.each(matches, self.appendBoatDayPicture, self);

					if( self.boatdayPics.length > 0 ){
						self.displayBoatDayLargePic(self.boatdayPics[0]);
					}
				});
			
			},

			uploadNewFile: function (event) {
				var self = this;
				var e = $(event.currentTarget);
				var opts = {};
				var cb = null;

				if( e.attr('name') == 'boatday-picture' ) {
					cb = function(file) {
						new FileHolderModel({ file: file, host: Parse.User.current().get('host') }).save().then(function(fh) {
							self.appendBoatDayPicture(fh);
							self.model.relation('boatdayPictures').add(fh);
							self.model.save();
						}, function(e) {
							console.log(e);
						});
					};
					opts.pdf = false;
				}
				this.uploadFile(event, cb, opts);
			
			},

			showLargePic: function( event ){
				var id = $(event.currentTarget).attr('file-id');
				this.displayBoatDayLargePic(this.boatdayPictures[id]);
			
			},

			displayBoatDayLargePic: function(FileHolder){

				var self = this;

				var largeImageTarget = this.$el.find('.boatday-pic-slider img.boatday-pic-large');
				
				largeImageTarget.attr('src', FileHolder.get('file').url());
				largeImageTarget.attr('data-id', FileHolder.id);

				this.$el.find('.boatday-pic-slider .boatday-pic-thumbs img').removeClass('current');

				var targetThumb = this.$el.find('.boatday-pic-slider .boatday-pic-thumbs img[file-id="'+FileHolder.id+'"]');
				targetThumb.addClass("current");

				this.$el.find('.boatday-pic-slider .large-pic').addClass('display-remove');

			},

			appendBoatDayPicture: function(FileHolder) {

				var file = FileHolder.get('file');
				var id = FileHolder.id;

				var htmlImage = '<img class="thumb" src="'+ file.url() +'"  file-id="'+ id +'"/>';
				var sliderThumbsTarget = this.$el.find('.boatday-pic-slider .boatday-pic-thumbs img:last');

				sliderThumbsTarget.before(htmlImage);
				
				this.boatdayPictures[FileHolder.id] = FileHolder;
				this.boatdayPics.push(FileHolder);

				this.displayBoatDayLargePic(FileHolder);
			
			},

			deleteBoatDayPicture: function(event) {
				event.preventDefault();

				var self = this;
				var id = $(event.currentTarget).closest('.large-pic').find('img.boatday-pic-large').attr('data-id');

				this.model.relation('boatdayPictures').remove(this.boatdayPictures[id]);
			
				this.model.save().then(function(){

					var thumbTarget = self.$el.find('.boatday-pic-slider .boatday-pic-thumbs img[file-id="'+id+'"]');
					
					delete self.boatdayPictures[id];

					thumbTarget.remove();

					var nextNum = null;
					var prevNum = null;
					
					for(var i = 0; i < self.boatdayPics.length; i++){

						if(self.boatdayPics[i].id == id ){
						
							self.boatdayPics.splice(i, 1);

							if( i > 0){
								prevNum = i - 1;
							}
							if( i < self.boatdayPics.length ){
								nextNum = i;
							}

						}

					}
					

					if( (nextNum == null) && (prevNum == null) ){
						self.$el.find('.boatday-pic-slider .large-pic').removeClass('display-remove');
						self.$el.find('.boatday-pic-slider .large-pic img.boatday-pic-large').attr('src', 'resources/boatday_img_placeholder_large.png');
					}
					else {
						if( prevNum != null ){
							self.displayBoatDayLargePic(self.boatdayPics[prevNum]);
						}
						else{
							self.displayBoatDayLargePic(self.boatdayPics[nextNum]);
						}
					}
				
				});
				
			},

		});

	return BoatdayOveviewView;

});
