define([
'jquery', 
'underscore', 
'parse',
'models/FileHolder',
'views/BaseView',
'text!templates/BoatTemplate.html',
'text!templates/ProfilePictureTemplate.html',
'text!templates/ProofOFInsuranceTemplate.html'
], function($, _, Parse, FileHolder, BaseView, BoatTemplate, ProfilePictureTemplate, ProofOFInsuranceTemplate){
	var BoatView = BaseView.extend({

		className: "view-boat",

		template: _.template(BoatTemplate),

		debug: true,
		
		boatPictures: {},
		proofOfInsurance: {},

		events: {

			"submit form" : "save",
			"change [name='boatPictures']": "uploadBoatPicture",
			"change [name='insurance']": "uploadInsurance",
			"click .delete-picture": 'deleteBoatPicture'

		},

		initialize: function() {

			if( this.model.get('status') != 'creation' ) {
				this.displayBoatPictures();
				this.displayProofOfInsurance();
			}

		},

		displayBoatPictures: function() {
			
			var self = this;

			self.$el.find('.boatPictures').html('');

			var fetchSuccess = function(collection) {
				_.each(collection.models, function( fh ) {
					var tpl = _.template(ProfilePictureTemplate);
					self.$el.find('.boatPictures').append(tpl({ 
						id: fh.id, 
						url: fh.get('file').url(),
						canDelete: self.model.get("status") == 'editing'
					}));
					self.boatPictures[fh.id] = fh;
				});
			};

			var fetchError = function(error) {
				console.log(error);
			};

			self.model.relation('boatPictures').query().collection().fetch().then(fetchSuccess, fetchError);
		},

		displayProofOfInsurance: function() {
			
			var self = this;

			self.$el.find('.proofOfInsurance').html('');

			var fetchSuccess = function(collection) {
				_.each(collection.models, function( fh ) {
					var tpl = _.template(ProofOFInsuranceTemplate);
					self.$el.find('.proofOfInsurance').append(tpl({ 
						id: fh.id, 
						url: fh.get('file').url(),
						createdAt: fh.createdAt
					}));
					self.proofOfInsurance[fh.id] = fh;
				});
			};

			var fetchError = function(error) {
				console.log(error);
			};

			self.model.relation('proofOfInsurance').query().collection().fetch().then(fetchSuccess, fetchError);
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

		deleteProofOfInsurance: function(event) {
			event.preventDefault();
			var self = this;
			var fid = $(event.currentTarget).attr('file-id');
			self.model.relation('proofOfInsurance').remove(self.boatPictures[fid]);
			self.model.save().then(function() {
				self.displayProofOfInsurance();
			});
		},

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		},

		uploadBoatPicture: function(event) {

			var self = this;
			var files = event.target.files;
			var parseFile = null;
			
			self.buttonLoader('Uploading...');

			if( files.length == 1) {

				if( files[0].type == 'image/png' ) {
					
					parseFile = new Parse.File('boatPicture.png', files[0]);

				} else if( files[0].type == 'image/jpeg' ) {

					parseFile = new Parse.File('boatPicture.jpg', files[0]);

				} else {

					self.fieldError('boatPicture', 'Bad format, try with a PNG or JPEG picture.');
					self.buttonLoader();
					$(event.target).val('');
					return null;

				}

				var uploadSuccess = function(file) {
					new FileHolder({ file: file }).save().then(function(fh) {
						self.model.relation('boatPictures').add(fh);
						self.model.save().then(function() {
							self.displayBoatPictures();
						});
						self.buttonLoader();
						$(event.target).val('');
					});
				};

				var uploadError = function(error) {

					self.fieldError('boatPicture', 'An error occured when we tried to upload your boat picture, try again please.');
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
					new FileHolder({ file: file }).save().then(function(fh) {
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
				this._in('hullID').val('2463');
				this._in('length').val('10');
				this._in('capacity').val('20');
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
				length: parseInt(this._in('length').val()),
				capacity: parseInt(this._in('capacity').val()),
				type: this._in('type').val(),
				features: {
					airConditioning: this._in('featureAirConditioning').is(':checked'),
					autopilot: this._in('featureAutopilot').is(':checked'),
					cooler: this._in('featureCooler').is(':checked'),
					depthFinder: this._in('featureDepthFinder').is(':checked'),
					fishFinder: this._in('featureFishFinder').is(':checked'),
					gps: this._in('featureGps').is(':checked'),
					grill: this._in('featureGrill').is(':checked'),
					internet: this._in('featureInternet').is(':checked'),
					liveBaitWell: this._in('featureLiveBaitWell').is(':checked'),
					microwave: this._in('featureMicrowave').is(':checked'),
					refrigeration: this._in('featureRefrigeration').is(':checked'),
					rodHolder: this._in('featureRodHolder').is(':checked'),
					shower: this._in('featureShower').is(':checked'),
					sink: this._in('featureSink').is(':checked'),
					stereo: this._in('featureStereo').is(':checked'),
					stereoAuxInput: this._in('featureStereoAuxInput').is(':checked'),
					sonar: this._in('featureSonar').is(':checked'),
					swimLadder: this._in('featureSwimLadder').is(':checked'),
					tvDvd: this._in('featureTvDvd').is(':checked'),
					trollingMotor: this._in('featureTrollingMotor').is(':checked'),
					wakeboardTower: this._in('featureWakeboardTower').is(':checked')
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