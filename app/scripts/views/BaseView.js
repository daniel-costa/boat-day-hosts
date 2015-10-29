define([
'parse',
'text!templates/NavigationTopTemplate.html',
'text!templates/NavigationLeftTemplate.html',
'text!templates/ThemeDashboardTemplate.html',
'text!templates/ModalTemplate.html',
'text!templates/GuestProfileTemplate.html',
], function(Parse, NavigationTopTemplate, NavigationLeftTemplate, ThemeDashboardTemplate, ModalTemplate, GuestProfileTemplate){
	var BaseView = Parse.View.extend({

		className: "view-base",

		navTopTpl: _.template(NavigationTopTemplate),
		
		navLeftTpl: _.template(NavigationLeftTemplate),

		dashboardCanvasTpl: _.template(ThemeDashboardTemplate),

		modalTpl:  _.template(ModalTemplate),

		subViews: [],

		debug: true,

		globalDebug: true,

		tempBinaries: { },

		theme: null,

		templateData: null,

		__ANIMATION_ENDS__: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',

		afterRenderInsertedToDom: function() {},

		splitURLParams: function(string){

			var array = {};

			var pair;
			var tokenize = /([^&=]+)=?([^&]*)/g;

			var re_space = function(s){
				return decodeURIComponent(s.replace(/\+/g, " "));
			};

			while (pair = tokenize.exec(string)) {

				//var data = [];
				//data[re_space(pair[1])] = re_space(pair[2]);
				
				array[re_space(pair[1])] = re_space(pair[2]);

				//array.push(data);
				//console.log("From baseview :" + re_space(pair[1]) + ":" + re_space(pair[2]));
				//console.log(array.length);

			}

			return array;

		},


		formatDateWithMonthAndDate: function(date){

			var dateStr = "";
			var _date = new Date(date);
			var _month = _date.getMonth(); 
			var _dt = _date.getDate(); 

			var month = new Array();
		    month[0] = "Jan.";
		    month[1] = "Feb.";
		    month[2] = "Mar.";
		    month[3] = "Apr.";
		    month[4] = "May";
		    month[5] = "June";
		    month[6] = "July";
		    month[7] = "Aug.";
		    month[8] = "Sep.";
		    month[9] = "Oct.";
		    month[10] = "Nov.";
		    month[11] = "Dec.";

			//dateStr = _dt + this.nth(_dt)+ " " +month[_month];
			dateStr = month[_month] + " " + _dt;

			return dateStr;
		},

		nth: function(d){
			if(d>3 && d<21) return 'th';

			switch (d % 10) {
				case 1:  return "st";
				case 2:  return "nd";
				case 3:  return "rd";
				default: return "th";
		    }

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

		getHostRate: function(type) {
			return type == 'business' ? Parse.Config.current().get("PRICE_HOST_CHARTER_PART") : Parse.Config.current().get("PRICE_HOST_PRIVATE_PART");
		},

		detectClickOnProfile: function(event) {

			var self = this;
			var id = $(event.currentTarget).attr('data-id');

			if( !id ) {
				return;
			}

			var tpl = _.template(GuestProfileTemplate);

			new Parse.Query(Parse.Object.extend('Profile')).get(id).then(function(profile) {

				var cb = function() {
					Parse.history.navigate('#/report/'+profile.id, true);
				};
			
				self.modal({
					title: profile.get('displayName'),
					body: tpl({ profile: profile }),
					noButton: true,
					noButtonText: 'Report',
					noCb: cb,
					yesButton: false,
					cancelButton: true,
					cancelButtonText: 'Close',
					closeButton: true
				});
			});

		},

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

			if(this.collection) {
				_.extend(data, { collection: this.collection.toJSON() });
			} 

			this.$el.html(this.template(data));

			var canvas = this.$el.find('.dashboard-canvas');
			if( canvas.length == 1 ) {
				var base = this.$el.html();
				var _next = $(this.dashboardCanvasTpl())
				var next = _next.find('.inner-content').html(base);

				this.$el.html(_next);
			}

			var navTop = this.$el.find('.top-navigation');
			if( navTop.length == 1 ) {
				navTop.html(this.navTopTpl());
			}

			var navLeft = this.$el.find('.left-navigation');
			if( navLeft.length == 1 ) {
				navLeft.html(this.navLeftTpl());
				$('#app').trigger('updateNotificationsAmount', this.$el.find('.total-notifications'));
			}

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

			if( $('.modal-dialog').length == 1 )
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
			var _dissmised = true; // define if it's a normal dissmis or a user dissmis

			if(opts.noCb) {
				_modal.find('.btn-no').click(function () {
					if( opts.noCbValidation && !opts.noCbValidation(_modal) ) {
						return ;
					}
					_exec = opts.noCb;
					_modal.modal('hide');
					_dissmised = false;
				});	
			}

			if(opts.yesCb) {
				_modal.find('.btn-yes').click(function () {
					if( opts.yesCbValidation && !opts.yesCbValidation(_modal) ) {
						return ;
					}
					_exec = opts.yesCb;
					_modal.modal('hide');
					_dissmised = false;
				});
			}

			_modal.on('hidden.bs.modal', function() {
				if( _exec ) 
					_exec(_modal);
				
				if( _dissmised && opts.cancelCb )
					opts.cancelCb(_modal);

				_modal.remove();
			});

			$('body').append(_modal);

			_modal.modal();

		},

		uploadFile: function(event, cb, opts) {

			if( typeof opts === "undefined" ) {
				opts = {};
			}

			var _opts = {
				png: typeof opts.png === "undefined" || opts.png,
				jpg: typeof opts.jpg === "undefined" || opts.jpg,
				pdf: typeof opts.pdf === "undefined" || opts.pdf
			};

			var self = this;
			var files = event.target.files;
			var parseFile = null;
			var fieldName = $(event.currentTarget).attr('name');
			var btn = self.$el.find('.btn[for="'+fieldName+'"]');
			
			self.cleanForm();
			self.buttonLoader('Uploading');

			if( btn.length === 1 ) {

				self.buttonLoader('Uploading', btn);

			}

			if( files.length == 1) {

				if( _opts.png && files[0].type == 'image/png' ) {
					
					parseFile = new Parse.File(fieldName+'.png', files[0]);

				} else if( _opts.jpg && files[0].type == 'image/jpeg' ) {

					parseFile = new Parse.File(fieldName+'.jpg', files[0]);

				} else if( _opts.pdf && files[0].type == 'application/pdf') {

					parseFile = new Parse.File(fieldName+'.pdf', files[0]);

				} else {

					var formats = "";
					formats += _opts.png ? ' PNG' : '';
					formats += _opts.jpg ? ' JPEG' : '';
					formats += _opts.pdf ? ' PDF' : '';
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

					self.fieldError(fieldName, 'An error occurred when we tried to upload your file.');
					self.buttonLoader();

				};
				
				parseFile.save().then(uploadSuccess, uploadError);

			}
		},

		boatdayActivityToDisplay: function(item) {

			switch(item) {
				case 'leisure': return 'Leisure'; break;
				case 'sports': return 'Water Sports'; break;
				case 'sailing': return 'Sailing'; break;
				case 'fishing': return 'Fishing'; break;
			}
			
		},

		boatdayCancellationToDisplay: function(item) {

			switch(item) {
				case 'flexible': return 'Flexible'; break;
				case 'moderate': return 'Moderate'; break;
				case 'strict': return 'Strict'; break;
			}
			
		},

		boatdayBookingToDisplay: function(item) {

			switch(item) {
				case 'manually': return 'Manual Book'; break;
				case 'automatically': return 'Instant Book'; break;
				case 'halfway': return 'Trusted Book'; break;
			}
			
		},

		dateParseToDisplayDate: function (date) {
			
			return new Date(date.iso ? date.iso : date).toLocaleDateString();

		},

		censorEmailFronString: function(str) {

			var pattern = /[^@\s]*@[^@\s]*\.[^@\s]*/g;
			var replacement = "[censored]";
			return str.replace(pattern, replacement);

		},

		censorLinksFronString: function(str) {

			// var pattern = /[a-zA-Z]*[:\/\/]*[A-Za-z0-9\-_]+\.+[A-Za-z0-9\.\/%&=\?\-_]+/ig;
			var pattern = /\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/ig;
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

		scheduleTimeToDisplayTime: function(startTime, endTime){
			var h = parseInt(startTime);
			var mm = (startTime-h) * 60;
			var dd = 'AM';

			if( h >= 12 ) {
				dd = 'PM';
				h -= 12;
			}

			var h2 = parseInt(endTime);
			var mm2 = (endTime-h2) * 60;
			var dd2 = 'AM';

			if( h2 >= 12 ) {
				dd2 = 'PM';
				h2 -= 12;
			}

			var startStr = (h==0?12:h)+':'+(mm==0?'00':+(mm < 10 ? '0'+mm : mm))+' '+dd;
			var endStr = (h2==0?12:h2)+':'+(mm2==0?'00':+(mm2 < 10 ? '0'+mm2 : mm2))+' '+dd2;
			return startStr + " - " + endStr;
		},

		isEmailValid: function(email) {

			var emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    		return emailPattern.test(email);

		},

		getRandomNumber: function(min, max) {
		
			return Math.round(Math.random() * (max - min) + min);
		
		},

		afterRender: function() {

			if( this.globalDebug && this.debug ) {
				this.debugAutofillFields();
			}

			this.afterRenderInsertedToDom();
			
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

		handleSaveErrors: function(error) {

			var self = this;
			self.buttonLoader();

			if( error.type && error.type == 'model-validation' ) {
				_.map(error.fields, function(message, field) { 
					self.fieldError(field, message);
				});
				self._error('One or more fields contains errors.');
			} else {
				self._error(error);
			}

		},

		fieldError: function(name, message) {

			var field = this._in(name);
			var attr = field.attr('delegate-error-to-button');

			if( typeof attr !== typeof undefined && attr !== false ) {
				field = this.$el.find('[for="'+field.attr('name')+'"]')
			}

			field.closest('.form-group').addClass("has-error");

			// $('<span>').addClass('glyphicon glyphicon-remove form-control-feedback field-error-auto').insertAfter(field);
			
			if(message) {

				var show = function() { $(this).popover('show'); };
				var hide = function() { $(this).popover('hide'); };

				var params = { 
					container: 'body',
					content: message,
					trigger: 'manual',
					placement: 'top'
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
			this.$el.find('.btn.field-error-flag').removeClass('field-error-flag');
			this.$el.find('.display-messages').html('');
			this.$el.find('.field-error-auto').remove();
			this.$el.find('.has-error').removeClass('has-error has-feedback');
			this.$el.find('.field-error-flag').popover('hide').unbind('focus mouseenter mouseleave hover blur');

		},

		buttonLoader: function( text, button ) {


			if( text ) {

				if( !button ) var button = this.$el.find('[type="submit"]');

				button.attr('data-loading-text', text).button('loading');

			} else {

				this.$el.find('[data-loading-text]').button('reset');

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