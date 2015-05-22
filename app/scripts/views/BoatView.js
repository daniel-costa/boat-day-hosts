define([
'models/FileHolderModel',
'models/CaptainRequestModel',
'views/BaseView',
'text!templates/BoatTemplate.html',
'text!templates/ThumbPictureTemplate.html',
'text!templates/ProofOFInsuranceTemplate.html',
'text!templates/CaptainsTableTemplate.html'
], function(FileHolderModel, CaptainRequestModel, BaseView, BoatTemplate, ThumbPictureTemplate, ProofOFInsuranceTemplate, CaptainsTableTemplate){
	var BoatView = BaseView.extend({

		className: "view-boat",

		template: _.template(BoatTemplate),

		debug: true,
		
		boatPictures: null,
		proofOfInsurance: {},

		events: {
			"submit form" : "save",
			"change [name='boatPictures']": "uploadBoatPicture",
			"change [name='insurance']": "uploadInsurance",
			"keypress [name='captain-email']": 'checkEnter',
			"click .delete-picture": 'deleteBoatPicture',
			"click .add-captain": "addCaptain"
		},

		initialize: function(data) {

			if( this.model.get('status') != 'creation' ) {
				this.displayBoatPictures();
				this.displayProofOfInsurance();
				this.displayCaptains();
			}

		},

		checkEnter: function(event) {

			if( event.keyCode == 13 ) {
				this.addCaptain(event);
			}

		},

		displayCaptains: function() {
			
			var self = this;
			
			self.$el.find('.captainsList').html('');
			
			var tpl = _.template(CaptainsTableTemplate);

			var displayObject = function( captain ) {
				self.$el.find('.captainsList').append(tpl({ 
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

			self.$el.find('.boatPictures').html('');
			self.boatPictures = {};

			var tpl = _.template(ThumbPictureTemplate);

			var displayObject = function( fh ) {	
				self.$el.find('.boatPictures').append(tpl({ 
					id: fh.id, 
					url: fh.get('file').url(),
					// canDelete: self.model.get("status") == 'editing',
					canDelete: true,
					fullWidth: false
				}));
				self.boatPictures[fh.id] = fh;
			};

			var displayAll = function(matches) {
				_.each(matches, displayObject);
			};

			var query = self.model.relation('boatPictures').query();
			query.descending("createdAt");
			query.find().then(displayAll);
		},

		displayProofOfInsurance: function() {
			
			var self = this;

			self.$el.find('.proofOfInsurance').html('');

			var tpl = _.template(ProofOFInsuranceTemplate);

			var displayObject = function( fh ) {		
				self.$el.find('.proofOfInsurance').append(tpl({ 
					id: fh.id, 
					url: fh.get('file').url(),
					createdAt: fh.createdAt
				}));
				self.proofOfInsurance[fh.id] = fh;
			};

			var displayAll = function(matches) {
				_.each(matches, displayObject);
			};

			var query = self.model.relation('proofOfInsurance').query();
			query.descending("createdAt");
			query.find().then(displayAll);
		},

		deleteBoatPicture: function(event) {
			event.preventDefault();
			var self = this;
			var fid = $(event.currentTarget).attr('file-id');
			self.model.relation('boatPictures').remove(self.boatPictures[fid]);
			self.model.save().then(function() {
				self.displayBoatPictures();
			});
		},

		addCaptain: function(event) {

			event.preventDefault();

			var self = this;

			self.buttonLoader('Adding Captain...');
			self.cleanForm();

			if( !self.isEmailValid(self._in('captain-email').val()) ) {
				self.fieldError('captain-email', 'Oops.. The email doesn\'t seem valid.');
				self.buttonLoader();
				return;
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

		uploadBoatPicture: function(event) {

			var self = this;
			var files = event.target.files;
			var parseFile = null;
			
			self.buttonLoader('Uploading...');
			self.cleanForm();

			if( files.length == 1) {

				if( files[0].type == 'image/png' ) {
					
					parseFile = new Parse.File('boatPicture.png', files[0]);

				} else if( files[0].type == 'image/jpeg' ) {

					parseFile = new Parse.File('boatPicture.jpg', files[0]);

				} else {

					self.fieldError('boatPictures', 'Bad format, try with a PNG or JPEG picture.');
					self.buttonLoader();
					$(event.target).val('');
					return null;

				}

				var uploadSuccess = function(file) {
					new FileHolderModel({ file: file }).save().then(function(fh) {
						self.model.relation('boatPictures').add(fh);
						self.model.save().then(function() {
							self.displayBoatPictures();
						});
						self.buttonLoader();
						$(event.target).val('');
					});
				};

				var uploadError = function(error) {

					self.fieldError('boatPictures', 'An error occured when we tried to upload your boat picture, try again please.');
					self.buttonLoader();
					$(event.target).val('');

				};
				
				parseFile.save().then(uploadSuccess, uploadError);

			}

		},

		uploadInsurance: function(event) {

			var self = this;
			var files = event.target.files;
			var parseFile = null;
			
			self.buttonLoader('Uploading...');
			self.cleanForm();

			if( files.length == 1) {

				if( files[0].type == 'image/png' ) {
					
					parseFile = new Parse.File('insurance.png', files[0]);

				} else if( files[0].type == 'image/jpeg' ) {

					parseFile = new Parse.File('insurance.jpg', files[0]);

				} else if( files[0].type == 'application/pdf') {

					parseFile = new Parse.File('insurance.pdf', files[0]);

				} else {

					self.fieldError('insurance', 'Bad format, try with a PNG, JPEG or PDF picture.');
					self.buttonLoader();
					$(event.target).val('');
					return null;

				}

				var uploadSuccess = function(file) {
					new FileHolderModel({ file: file }).save().then(function(fh) {
						self.model.relation('proofOfInsurance').add(fh);
						self.model.save().then(function() {
							self.displayProofOfInsurance();
						});
						self.buttonLoader();
						$(event.target).val('');
					});
				};

				var uploadError = function(error) {

					self.fieldError('insurance', 'An error occured when we tried to upload your insurance, try again please.');
					self.buttonLoader();

				};
				
				parseFile.save().then(uploadSuccess, uploadError);

			}

		},

		debugAutofillFields: function() {

			if( this.model.get('status') == 'creation' ) {
				this._in('name').val('Fury');
				this._in('hullID').val('691 93231 8431');
				this._in('length').val('10');
				this._in('capacity').val('20');
				this._in('buildYear').val('1996');
			}

		},

		save: function(event) {

			event.preventDefault();

			var self = this;
			var baseStatus = this.model.get("status");

			self.buttonLoader('Saving');
			self.cleanForm();
			
			if( baseStatus == 'editing' ) {
				
				var err = false;

				if (_.size(self.boatPictures) == 0) {

					this.fieldError('boatPictures', 'Oops, you missed one!');
					err = true;
				}

				if (_.size(self.proofOfInsurance) == 0) {

					this.fieldError('insurance', 'Oops, you missed one!');
					err = true;
				}

				if( err ) {
					self.buttonLoader();
					return;
				}
				
			}

			var data = {
				status: baseStatus == 'editing' ? 'complete' : 'editing',
				name: this._in('name').val(),
				hullID: this._in('hullID').val(),
				buildYear: this._in('buildYear').val(),
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
			};

			var saveSuccess = function( boat ) {

				if( baseStatus == 'creation' ) {

					var hostSaveSuccess = function() {
						Parse.history.navigate('boat/'+boat.id, true);
					};

					var hostSaveError = function(error) {
						console.log(error);
					}

					var host = Parse.User.current().get("host");
					host.relation('boats').add(boat);
					host.save().then(hostSaveSuccess, hostSaveError);

				} else {
					
					Parse.history.navigate('dashboard', true);	

				}

			};

			var saveError = function(error) {
				
				console.log(error);
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