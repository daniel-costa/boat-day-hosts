define([
'models/FileHolderModel',
'models/CaptainRequestModel',
'views/BaseView',
'text!templates/BoatTemplate.html',
'text!templates/BoatPictureTemplate.html',
'text!templates/BoatInsuranceTemplate.html',
'text!templates/BoatCaptainTemplate.html'
], function(FileHolderModel, CaptainRequestModel, BaseView, BoatTemplate, BoatPictureTemplate, BoatInsuranceTemplate, BoatCaptainTemplate){
	var BoatView = BaseView.extend({

		className: "view-boat",

		template: _.template(BoatTemplate),

		debug: true,

		events: {
			"submit form" : "save",
			"change .upload": "uploadNewFile",
			"click .btn-upload": "clickUpload",
			"keypress [name='captain-email']": 'checkEnter',
			"click .delete-picture": 'deleteBoatPicture',
			"click .delete-insurance": 'deleteInsurance',
			"click .add-captain": "addCaptain"
		},

		theme: "dashboard",
		
		boatPictures: {},
		
		proofOfInsurance: {},
		
		initialize: function(data) {

			if( this.model.get('status') != 'creation' ) {
				this.displayBoatPictures();
				this.displayProofOfInsurance();
				this.displayCaptains();
			}

		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;
			
			self.$el.find('.navbar-brand').text('BOAT MANAGEMENT');
			self.$el.find('.left-navigation .new-boat').addClass('active');

			return this;

		},

		checkEnter: function(event) {

			if( event.keyCode == 13 ) {
				this.addCaptain(event);
			}

		},

		displayCaptains: function() {
			
			var self = this;
			
			self.$el.find('.captains-list').html('');
			
			var tpl = _.template(BoatCaptainTemplate);

			var displayObject = function( captain ) {
				self.$el.find('.captains-list').append(tpl({ 
					id: captain.id, 
					email: captain.get('email'),
					status: captain.get('status')
				}));
			};

			var displayAll = function(matches) {
				_.each(matches, displayObject);
			};

			var query = self.model.relation('captains').query();
			query.descending("createdAt");
			query.find().then(displayAll);

		},

		displayBoatPictures: function() {
			
			var self = this;

			self.$el.find('.picture-files').html('');
			self.boatPictures = {};

			var tpl = _.template(BoatPictureTemplate);

			var displayAll = function(matches) {
				_.each(matches, function( fh ) {	
					self.$el.find('.picture-files').append(tpl({ 
						id: fh.id,
						file: fh.get('file')
					}));
					self.boatPictures[fh.id] = fh;
				});
			};

			var query = self.model.relation('boatPictures').query();
			query.descending("createdAt");
			query.find().then(displayAll);
		},

		displayProofOfInsurance: function() {
			
			var self = this;

			self.$el.find('.insurance-files').html('');
			self.proofOfInsurance = {};

			var tpl = _.template(BoatInsuranceTemplate);

			var displayAll = function(matches) {
				_.each(matches, function( fh ) {		
					self.$el.find('.insurance-files').append(tpl({ 
						id: fh.id,
						file: fh.get('file')
					}));
					self.proofOfInsurance[fh.id] = fh;
				});
			};

			var query = self.model.relation('proofOfInsurance').query();
			query.descending("createdAt");
			query.find().then(displayAll);
		},

		deleteBoatPicture: function(event) {
			event.preventDefault();
			var self = this;
			self.model.relation('boatPictures').remove(self.boatPictures[$(event.currentTarget).attr('file-id')]);
			self.model.save().then(function() {
				self.displayBoatPictures();
			});
		},

		deleteInsurance: function(event) {
			event.preventDefault();
			var self = this;
			self.model.relation('proofOfInsurance').remove(self.proofOfInsurance[$(event.currentTarget).attr('file-id')]);
			self.model.save().then(function() {
				self.displayProofOfInsurance();
			});
		},

		addCaptain: function(event) {

			event.preventDefault();

			var self = this;
			var addCaptainButton = self.$el.find('button.add-captain');

			self.buttonLoader('Adding Captain...', addCaptainButton);
			self.buttonLoader('Adding Captain...');
			self.cleanForm();

			if( !self.isEmailValid(self._in('captain-email').val()) ) {
				self.fieldError('captain-email', 'Oops.. The email doesn\'t seem valid.');
				self.buttonLoader();
				return ;
			}

			var createCaptainRequest = function(email, captain, profile) {

				var saveBoatSuccess = function() {
					self._in('captain-email').val('');
					self.displayCaptains();
					self.buttonLoader();
				};

				var saveCaptainSuccess = function(captain) { 
					self.model.relation('captains').add(captain);
					self.model.save().then(saveBoatSuccess);
				};

				var data = {
					email: email,
					captainHost: captain,
					captainProfile: profile,
					fromHost: Parse.User.current().get('host'),
					fromProfile: Parse.User.current().get('profile'),
					boat: self.model
				};

				var captain = new CaptainRequestModel(data);
				captain.save().then(saveCaptainSuccess);

			};

			var query = self.model.relation('captains').query();
			query.equalTo('email', self._in('captain-email').val());
			query.count().then(function(total) {

				if( total > 0 ) {
					self.fieldError('captain-email', 'Oops.. Seems your already have this user as a captain of this boat.');
					self.buttonLoader();
					return;
				}
					

				var query = new Parse.Query(Parse.User);
				query.equalTo('email', self._in('captain-email').val());
				query.count().then(function(total) {

					if( total == 0 ) {

						createCaptainRequest(self._in('captain-email').val());

					} else {

						query.first().then(function(user) {
							createCaptainRequest(self._in('captain-email').val(), user.get('host'), user.get('profile'));
						});

					}

				});
			})

		},


		uploadNewFile: function (event) {

			var self = this;
			var e = $(event.currentTarget);
			var opts = {};
			var cb = null;

			if( e.attr('name') == 'boat-picture' ) {

				cb = function(file) {
					
					new FileHolderModel({ file: file }).save().then(function(fh) {
						self.model.relation('boatPictures').add(fh);
						self.model.save().then(function() {
							self.displayBoatPictures();
						});
					});

				};

				opts.pdf = false;

			} else {

				cb = function(file) {
					
					new FileHolderModel({ file: file }).save().then(function(fh) {
						self.model.relation('proofOfInsurance').add(fh);
						self.model.save().then(function() {
							self.displayProofOfInsurance();
						});
					});

				};

			}

			this.uploadFile(event, cb, opts);

		},

		debugAutofillFields: function() {

			if( this.model.get('status') == 'creation' ) {
				this._in('name').val('Fury');
				this._in('hullID').val('691 93231 8431');
				this._in('type').val('Bla bli blu blo');
				this._in('length').val('10');
				this._in('capacity').val('20');
				this._in('buildYear').val('1996');
			}

		},

		save: function(event) {

			event.preventDefault();

			var self = this;
			var baseStatus = this.model.get("status");
			
			var cb = function() {
				self.saveData();
			};

			if( baseStatus == 'creation' ) {

				this.modal({
					title: 'Add Boat',
					body: 'Be sure to double check! Once this information is submitted it can only be changed by contacting us in the Host Center.',
					noButton: false,
					yesButtonText: 'Continue',
					yesCb: cb
				});

			} else {

				cb();

			}

		},

		saveData: function(event) {

			// event.preventDefault();

			var self = this;
			var baseStatus = this.model.get("status");

			self.buttonLoader('Saving');
			self.cleanForm();
			
			if( baseStatus == 'editing' ) {
				
				var err = false;

				if (_.size(self.boatPictures) == 0) {

					this.fieldError('boat-picture', 'Oops, you missed one. Don’t forget to upload at least one great photo of your boat.');
					err = true;
				}

				if (_.size(self.proofOfInsurance) == 0) {

					this.fieldError('insurance-file', 'Oops, you missed one! Please upload proof of insurance for your boat.');
					err = true;
				}

				if( err ) {
					self.buttonLoader();
					return;
				}
				
			}

			var data = {};

			if( baseStatus == 'creation' ) {

				_.extend(data, {
					status: 'editing',
					name: this._in('name').val(),
					hullID: this._in('hullID').val(),
					buildYear: parseInt(this._in('buildYear').val()),
					length: parseInt(this._in('length').val()),
					capacity: parseInt(this._in('capacity').val()),
					type: this._in('type').val(),
					features: {
						airConditioning: Boolean(this._in('featureAirConditioning').is(':checked')),
						autopilot: Boolean(this._in('featureAutopilot').is(':checked')),
						cooler: Boolean(this._in('featureCooler').is(':checked')),
						depthFinder: Boolean(this._in('featureDepthFinder').is(':checked')),
						fishFinder: Boolean(this._in('featureFishFinder').is(':checked')),
						gps: Boolean(this._in('featureGps').is(':checked')),
						grill: Boolean(this._in('featureGrill').is(':checked')),
						internet: Boolean(this._in('featureInternet').is(':checked')),
						liveBaitWell: Boolean(this._in('featureLiveBaitWell').is(':checked')),
						microwave: Boolean(this._in('featureMicrowave').is(':checked')),
						refrigeration: Boolean(this._in('featureRefrigeration').is(':checked')),
						rodHolder: Boolean(this._in('featureRodHolder').is(':checked')),
						shower: Boolean(this._in('featureShower').is(':checked')),
						sink: Boolean(this._in('featureSink').is(':checked')),
						stereo: Boolean(this._in('featureStereo').is(':checked')),
						stereoAuxInput: Boolean(this._in('featureStereoAuxInput').is(':checked')),
						sonar: Boolean(this._in('featureSonar').is(':checked')),
						swimLadder: Boolean(this._in('featureSwimLadder').is(':checked')),
						tvDvd: Boolean(this._in('featureTvDvd').is(':checked')),
						trollingMotor: Boolean(this._in('featureTrollingMotor').is(':checked')),
						wakeboardTower: Boolean(this._in('featureWakeboardTower').is(':checked'))
					}
				})

			} else {

				data.status = 'complete';

			}


			var saveSuccess = function( boat ) {

				if( baseStatus == 'creation' ) {

					var host = Parse.User.current().get("host");
					host.relation('boats').add(boat);
					host.save().then(function() {
						Parse.history.navigate('boat/'+boat.id, true);
					}, saveError);

				} else {
					
					self.render();
					self._info('Your boat is added');

				}

			};

			var saveError = function(error) {
				
				self.buttonLoader();

				if( error.type && error.type == 'model-validation' ) {

					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});

				} else {

					self._error(error);
				}

			};
			
			this.model.save(data).then(saveSuccess, saveError);
		}

	});
	return BoatView;
});