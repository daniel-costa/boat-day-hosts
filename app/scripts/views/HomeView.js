define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/HomeTemplate.html'
], function($, _, Parse, BaseView, HomeTemplate){
	var HomeView = BaseView.extend({

		className: "view-home",

		template: _.template(HomeTemplate),

		__TIMER_BG_ROTATION__: 6000,
		__PERCENTAGE_CELLS_TO_CHANGE__: 0.30,
		__CELL_MIN_HEIGHT__: 180,
		__CELL_MAX_HEIGHT__: 240,
		__LINES__: 6,

		totalCells: 0,

		events: {

			"submit form" : "signIn",

		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			var self = this;

			this.generateCells();

			var cells = this.$el.find('.cell');
			var totalCells = cells.length;
			var cellsToChange = Math.ceil(totalCells * self.__PERCENTAGE_CELLS_TO_CHANGE__);
			
			var updatePicture = function(){
				for(var i = 0; i < cellsToChange; i++) {
					var j = self.getRandomNumber(1, totalCells);
					console.log()
					self.setBackground( $(cells.get(j)) );
				}

			};

			// setInterval(updatePicture, this.__TIMER_BG_ROTATION__);
			// updatePicture();

			return this;

		},

		generateCells: function() {

			var self = this;
			var cover = $(document).height() * self.__LINES__;
			var covered = 0;
			var parent = this.$el.find('.wall');

			while(covered < cover) {
				
				var id = this.getRandomNumber(1, 75);
				var h = this.getRandomNumber(self.__CELL_MIN_HEIGHT__, self.__CELL_MAX_HEIGHT__);
				var inner = $('<div>').addClass('inner');

				self.totalCells++;
				covered += h;

				$('<div>').css({
					height: h,
					backgroundImage: 'url(resources/home/picture-'+id+'.jpg)'
				})
				.addClass('cell')
				.attr('data-id', id)
				.appendTo(parent)
				.append(inner);
			}
		},

		setBackground: function(e) {
			var current = parseInt(e.attr('data-id'));
			var next  = (current + 1) % 75 + 1;
			
			console.log(current + ' - ' + next);

			var eTrans = e.find('.inner');

			var uCurr  = e.css('background-image');
			var uNext = 'url(resources/home/picture-'+ next +'.jpg)';
			
			eTrans.css({ backgroundImage: uCurr });

			setTimeout(function() {
				e.css({ backgroundImage: uNext });
				e.attr('data-id', next);
			
				eTrans.fadeOut(3000, function() {
					eTrans.css({ backgroundImage: '' });
					eTrans.show();
				});
			}, 500);

		},

		signIn: function(event){

			event.preventDefault();

			var self = this;

			var logInSuccess = function(user) {

				Parse.history.navigate('dashboard', true);

			};

			var logInError = function(error) {
				console.log(error.message);
				self._error(error.message);
			};

			Parse.User.logIn(this._in('email').val(), this._in('password').val()).then(logInSuccess, logInError);
		
		},

	});
	return HomeView;
});
