define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/BoatTemplate.html'
], function($, _, Parse, BaseView, BoatTemplate){
	var BoatView = BaseView.extend({

		className: "view-boat",

		template: _.template(BoatTemplate),

		boatPicture: null, 
		insurance: null,

		debug: true,

		events: {

			"submit form" : "save",
			"change [name='boatPicture']": "uploadBoatPicture",
			"change [name='insurance']": "uploadInsurance"

		},

		tempBoatPicture: null,

		tempInsurance: null,

		initialize: function() {

			// if( this.model.get('status') != 'creation' ) {
			// 	this.tempInsurance = this.model.get('insurance');
			// 	this.tempBoatPicture = this.model.get('boatPicture');
			// }

		},

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		},

		uploadBoatPicture: function() {

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
					
					self.boatPicture = parseFile;
					var preview = $('<img/>').attr('src', parseFile.url()).css({ maxWidth : '100%' }).insertBefore(self._in('boatPicture'));
					self.buttonLoader();

				};

				var uploadError = function(error) {

					self.fieldError('boatPicture', 'An error occured when we tried to upload your boat picture, try again please.');
					self.buttonLoader();

				};
				
				parseFile.save().then(uploadSuccess, uploadError);

			}

		},

		uploadInsurance: function() {

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

				}else {

					self.fieldError('insurance', 'Bad format, try with a PNG, JPEG or PDF picture.');
					self.buttonLoader();
					$(event.target).val('');
					return null;

				}

				var uploadSuccess = function(file) {
					
					self.insurance = parseFile;
					var preview = $('<img/>').attr('src', parseFile.url()).css({ maxWidth : '100%' }).insertBefore(self._in('insurance'));
					self.buttonLoader();

				};

				var uploadError = function(error) {

					self.fieldError('insurance', 'An error occured when we tried to upload your insurance, try again please.');
					self.buttonLoader();

				};
				
				parseFile.save().then(uploadSuccess, uploadError);

			}

		},

		// uploadInsurance: function () {

		// 	var self = this;
		// 	var e = event;

		// 	self.buttonLoader('uploading file');

		// 	if( e.target.files.length == 1 ) {

		// 		var file = e.target.files[0];
		// 		var name;

		// 		if( file.type == 'image/png' ) {
					
		// 			name = 'proofInsurance.png';

		// 		} else if( file.type == 'image/jpeg' ) {

		// 			name = 'proofInsurance.jpg';

		// 		} else if( file.type == 'application/pdf' ) {

		// 			name = 'proofInsurance.pdf';

		// 		} else {

		// 			this._error('Your proof of insurance "' + file.name + '" must be in the format PNG, JPEG or PDF');
		// 			$(e.target).val('');
		// 			self.buttonLoader();
		// 			return;

		// 		}

		// 		var uploadSuccess = function(file) {

		// 			self.tempInsurance = file;
		// 			self.buttonLoader();

		// 		};

		// 		var uploadError = function(error) {

		// 			console.log(error);
		// 			self._error('An error occured when we tried to upload your file, try again please.');
		// 			self.buttonLoader();

		// 		};
				
		// 		new Parse.File(name, file).save().then(uploadSuccess, uploadError);

		// 	}

		// },

		debugAutofillFields: function() {

			this._in('name').val('Fury');
			this._in('hullID').val('2463');
			this._in('length').val('10');
			this._in('capacity').val('20');
		},

		save: function(event) {

			event.preventDefault();

			var self = this;
			var baseStatus = this.model.get("status");

			self.buttonLoader('Saving');
			self.cleanForm();

			var data = {
				status: 'complete',
				name: this._in('name').val(),
				hullID: this._in('hullID').val(),
				length: this._in('length').val(),
				capacity: this._in('capacity').val(),
				// insurance: this.tempInsurance,
				// boatPicture: this.tempBoatPicture
				boatPicture: this.boatPicture, 
				insurance: this.insurance
			};

			var saveSuccess = function( boat ) {
				
				if( baseStatus == 'creation' ) {

					var hostSaveSuccess = function() {
						Parse.history.navigate('boat/'+boat.id, true);

					};

					var hostSaveError = function(error) {
						console.log(error);
					}
					console.log("CHECKPOINT 1");

					var host = Parse.User.current().get("host");
					host.relation('boats').add(boat);
					host.save().then(hostSaveSuccess, hostSaveError);

				} else {
					Parse.history.navigate('dashboard', true);

				}

			};

			var saveError = function(error) {
				
				self.buttonLoader();

				if( error.type && error.type == 'model-validation' ) {

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
	return BoatView;
});