define([
'parse',
'text!templates/TopNavigationTemplate.html',
'text!templates/ModalTemplate.html',
], function(Parse, TopNavigationTemplate, ModalTemplate){
	var BaseView = Parse.View.extend({

		className: "view-base",

		topNav: _.template(TopNavigationTemplate),

		modalTpl:  _.template(ModalTemplate),

		subViews: [],

		debug: false,

		globalDebug: true,

		tempBinaries: { },

		theme: null,

		templateData: null,

		__ANIMATION_ENDS__: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',

		render: function() {
			console.log("### Render by BaseView (" + this.className + ") ###");

			var data = {
				self: this
			};

			if( this.templateData ) {
				_.extend(data, this.templateData);
			}


			if( this.model ) {
				_.extend(data, this.model._toFullJSON());
			}

			console.log(data);
			if(this.collection) {
				_.extend(data, { collection: this.collection.toJSON() });
			} 

			this.$el.html(this.template(data));
			this.displayTopNav();

			this.$el.find('[data-toggle="tooltip"]').tooltip();

			if( this.theme ) {
				$("body").removeClass(function(index, css) {
					return (css.match(/(^|\s)theme-\S+/g) || []).join(' ');
				}).addClass('theme-' + this.theme);
			}

			return this;
		},


		clickUpload: function(event) {

			this.$el.find('input[name="'+$(event.currentTarget).attr('for')+'"]').click();
			
		},

		modal: function(opts) {

			var self = this;

			if( this.$el.find('.modal-dialog').length == 1 )
				return;

			var params = {
				title:            typeof opts.title            !== 'undefined' ? opts.title : '',
				body:             typeof opts.body             !== 'undefined' ? opts.body : '',
				closeButton:      typeof opts.closeButton      !== 'undefined' ? opts.closeButton : false,
				cancelButton:     typeof opts.cancelButton     !== 'undefined' ? opts.cancelButton : true,
				cancelButtonText: typeof opts.cancelButtonText !== 'undefined' ? opts.cancelButtonText : 'Cancel',
				noButton:         typeof opts.noButton         !== 'undefined' ? opts.noButton : true,
				noButtonText:     typeof opts.noButtonText     !== 'undefined' ? opts.noButtonText : 'No',
				yesButton:        typeof opts.yesButton        !== 'undefined' ? opts.yesButton : true,
				yesButtonText:    typeof opts.yesButtonText    !== 'undefined' ? opts.yesButtonText : 'Yes'
			};

			var _modal = $(self.modalTpl(params));
			var _exec = null;

			if(opts.noCb) {
				_modal.find('.btn-no').click(function () {
					_exec = opts.noCb;
					_modal.modal('hide');
				});	
			}

			if(opts.yesCb) {
				_modal.find('.btn-yes').click(function () {
					_exec = opts.yesCb;
					_modal.modal('hide');
				});
			}
			
			_modal.on('hidden.bs.modal', function() {
				if( _exec ) 
					_exec();

				_modal.remove();
			});

			this.$el.append(_modal);

			_modal.modal();

		},

		uploadFile: function(event, cb, opts) {

			if( typeof opts === "undefined" ) {
				opts = {};
			}

			var opts = {
				png: typeof opts.png === "undefined" || opts.png,
				jpg: typeof opts.jpg === "undefined" || opts.jpg,
				pdf: typeof opts.pdf === "undefined" || opts.pdf
			};

			var self = this;
			var files = event.target.files;
			var parseFile = null;
			var fieldName = $(event.currentTarget).attr('name');

			self.buttonLoader('Uploading...');

			if( files.length == 1) {

				if( opts.png && files[0].type == 'image/png' ) {
					
					parseFile = new Parse.File(fieldName+'.png', files[0]);

				} else if( opts.jpg && files[0].type == 'image/jpeg' ) {

					parseFile = new Parse.File(fieldName+'.jpg', files[0]);

				} else if( opts.pdf && files[0].type == 'application/pdf') {

					parseFile = new Parse.File(fieldName+'.pdf', files[0]);

				} else {

					var formats = "";
					formats += opts.png ? ' PNG' : '';
					formats += opts.jpg ? ' JPEG' : '';
					formats += opts.pdf ? ' PDF' : '';
					self.fieldError(fieldName, 'Bad format. Supported formats:'+formats);
					self.buttonLoader();
					$(event.target).val('');
					return null;

				}

				var uploadSuccess = function(file) {
					
					self.tempBinaries[fieldName] = file;
					cb(file);
					$(event.target).val('');
					self.buttonLoader();

				};

				var uploadError = function(error) {

					self.fieldError(fieldName, 'An error occured when we tried to upload your picture, try again please.');
					self.buttonLoader();

				};
				
				parseFile.save().then(uploadSuccess, uploadError);

			}
		},

		dateParseToDisplayDate: function (date) {

			return new Date(date.iso).toLocaleDateString();

		},

		censorEmailFronString: function(str) {

			var pattern = /[^@\s]*@[^@\s]*\.[^@\s]*/g;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);

		},

		censorLinksFronString: function(str) {

			var pattern = /[a-zA-Z]*[:\/\/]*[A-Za-z0-9\-_]+\.+[A-Za-z0-9\.\/%&=\?\-_]+/ig;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);

		},

		censorPhoneNumbersFronString: function(str) {

			var pattern = /(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/ig;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);

		},

		censorAll: function(str) {

			return  this.censorPhoneNumbersFronString(this.censorLinksFronString(this.censorEmailFronString(str)));

		},

		censorField: function(event) {

			$(event.currentTarget).val( this.censorAll($(event.currentTarget).val()));
			
		},

		departureTimeToDisplayTime: function(time) {

			var h = parseInt(time);
			var mm = (time-h) * 60;
			var dd = 'AM';

			if( h >= 12 ) {
				dd = 'PM';
				h -= 12;
			}

			return (h==0?12:h)+':'+(mm==0?'00':+(mm < 10 ? '0'+mm : mm))+' '+dd;
			
		},

		isEmailValid: function(email) {

			var emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    		return emailPattern.test(email);

		},

		displayTopNav: function() {

			var tn = this.$el.find('.top-nav');

			if( tn.length == 1 ) {
				tn.html(this.topNav());
			}

		},

		getRandomNumber: function(min, max) {
		
			return Math.round(Math.random() * (max - min) + min);
		
		},

		afterRender: function() {

			if( this.globalDebug && this.debug ) {
				this.debugAutofillFields();
			}
			
		},

		scorePassword: function(pass) {
			var score = 0;

			if (!pass)
				return score;

			// award every unique letter until 5 repetitions
			var letters = new Object();
			for (var i=0; i<pass.length; i++) {
				letters[pass[i]] = (letters[pass[i]] || 0) + 1;
				score += 5.0 / letters[pass[i]];
			}

			// bonus points for mixing it up
			var variations = {
				digits: /\d/.test(pass),
				lower: /[a-z]/.test(pass),
				upper: /[A-Z]/.test(pass),
				nonWords: /\W/.test(pass),
			}

			var variationCount = 0;
			for (var check in variations) {
				variationCount += (variations[check] == true) ? 1 : 0;
			}
			score += (variationCount - 1) * 10;

			return parseInt(score);
		},

		fieldError: function(name, message) {

			var field = this._in(name);

			field.closest('.form-group').addClass("has-error has-feedback");

			$('<span>').addClass('glyphicon glyphicon-remove form-control-feedback field-error-auto').insertAfter(field);
			
			if(message) {

				var show = function() { $(this).popover('show'); };
				var hide = function() { $(this).popover('hide'); };

				var params = { 
					container: 'body',
					content: message,
					trigger: 'manual'
				};

				if( field.hasClass('field-error-flag') ) {

					field.data('bs.popover').options.content = message;

				} else {

					field.addClass('field-error-flag').popover(params);	

				}

				field.focus(show).blur(hide).hover(show, hide)
			}

		},

		cleanForm: function() {

			this.$el.find('.field-error-auto').remove();
			this.$el.find('.has-error').removeClass('has-error has-feedback');
			this.$el.find('.field-error-flag').popover('hide').unbind('focus mouseenter mouseleave hover blur');

		},

		buttonLoader: function( text, button ) {

			if( !button ) {
			
				var button = this.$el.find('[type="submit"]');

			}

			if( text ) {

				button.attr('data-loading-text', text).button('loading');

			} else {

				button.button('reset');

			}
		},

		debugAutofillFields: function() { },

		teardown: function() {
			if(this.model) {
				this.model.off(null, null, this);
			}
			this.remove();
		},
		
		_in: function(names) {
			var str = "";
			_.each(names.split(','), function(item) {
				if(str!="") str += ', ';
				str += '[name="' + item.trim() + '"]';
			})
			return this.$el.find(str);

		},

		_error: function(message) {

			$(document).trigger('globalError', message);

		},

		_info: function(message) {

			$(document).trigger('globalInfo', message);

		}
	});
	return BaseView;
});