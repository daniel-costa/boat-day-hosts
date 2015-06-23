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
				this.displayInsuranceFiles();
				this.displayCaptains();
			}

		},

		render: function() {

			BaseView.prototype.render.call(this);

			var self = this;

			self.$el.find('.left-navigation .menu-new-boat').addClass('active');
			self.$el.find('.left-navigation a.link').hide();
			self.$el.find('.left-navigation a.menu-new-boat').show().css('display', "block");

			return this;

		},

		checkEnter: function(event) {

			if( event.keyCode == 13 ) {
				this.addCaptain(event);
			}

		},

		displayBoatPictures: function() {
			
			var self = this;

			self.$el.find('.picture-files').html('');
			self.boatPictures = {};

			var query = self.model.relation('boatPictures').query();
			query.ascending("createdAt");
			query.find().then(function(matches) {
				_.each(matches, self.appendBoatPicture, self);
			});
		},

		appendBoatPicture: function(FileHolder) {

			this.$el.find('.picture-files').append(_.template(BoatPictureTemplate)({ 
				id: FileHolder.id,
				file: FileHolder.get('file')
			}));
			
			this.boatPictures[FileHolder.id] = FileHolder;
		},

		deleteBoatPicture: function(event) {

			event.preventDefault();
			var id = $(event.currentTarget).attr('file-id');
			this.model.relation('boatPictures').remove(this.boatPictures[id]);
			this.model.save();
			delete this.boatPictures[id];
			$(event.currentTarget).closest('.boat-picture').remove();

		},

		displayInsuranceFiles: function() {
			
			var self = this;

			self.$el.find('.insurance-files').html('');
			
			self.proofOfInsurance = {};

			var query = self.model.relation('proofOfInsurance').query();
			query.ascending("createdAt");
			query.find().then(function(matches) {
				_.each(matches, self.appendInsurance, self);
			});
		},

		appendInsurance: function(FileHolder) {

			this.$el.find('.insurance-files').append(_.template(BoatInsuranceTemplate)({ 
				id: FileHolder.id,
				file: FileHolder.get('file')
			}));

			this.proofOfInsurance[FileHolder.id] = FileHolder;

		},

		deleteInsurance: function(event) {
			event.preventDefault();
			var id = $(event.currentTarget).attr('file-id');
			this.model.relation('proofOfInsurance').remove(this.proofOfInsurance[id]);
			this.model.save();
			delete this.proofOfInsurance[id];
			$(event.currentTarget).closest('.file').remove();
		},


		displayCaptains: function() {
			
			var self = this;
			
			self.$el.find('.captains-list').html('');

			var displayAll = function(matches) {
				_.each(matches, self.appendCaptain, self);
			};

			var query = self.model.relation('captains').query();
			query.ascending("createdAt");
			query.find().then(displayAll);

		},

		appendCaptain: function(CaptainRequest) {

			console.log(this.$el.find('.captains-list'));
			this.$el.find('.captains-list').append(_.template(BoatCaptainTemplate)({ 
				id: CaptainRequest.id, 
				email: CaptainRequest.get('email'),
				status: CaptainRequest.get('status')
			}));

		},

		addCaptain: function(event) {

			event.preventDefault();

			var self = this;
			var addCaptainButton = self.$el.find('button.add-captain');

			self.buttonLoader('Adding', addCaptainButton);
			self.buttonLoader('Adding Captain');
			self.cleanForm();

			if( !self.isEmailValid(self._in('captain-email').val()) ) {
				self.fieldError('captain-email', 'Oops.. The email doesn\'t seem valid.');
				self.buttonLoader();
				return ;
			}

			var createCaptainRequest = function(email, captain, profile) {

				var saveBoatSuccess = function() {
					self._in('captain-email').val('');
					self.appendCaptain(captain);
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
						self.appendBoatPicture(fh);
						self.model.relation('boatPictures').add(fh);
						self.model.save();
					});
				};
				opts.pdf = false;
			} else {
				cb = function(file) {
					new FileHolderModel({ file: file }).save().then(function(fh) {
						self.appendInsurance(fh);
						self.model.relation('proofOfInsurance').add(fh);
						self.model.save();
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
					//self._info('Your boat is added');

				}

			};

			var saveError = function(error) {
				self.handleSaveErrors(error);
			};
			
			this.model.save(data).then(saveSuccess, saveError);
		}

	});
	return BoatView;
});