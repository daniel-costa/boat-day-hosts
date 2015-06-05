define([
'views/BaseView',
'text!templates/ResetPasswordTemplate.html'
], function(BaseView, ResetPasswordTemplate){
	var ResetPasswordView = BaseView.extend({

		className: "view-reset-password container",

		template: _.template(ResetPasswordTemplate),

		theme: "guest",

		queryString: null,

		initialize: function(data) {
			
			this.queryString = data.queryString;

		},

		render: function() {
		
			BaseView.prototype.render.call(this);

			var urlParams = {};
			var pair;
			var tokenize = /([^&=]+)=?([^&]*)/g;
			var re_space = function (s) {
				return decodeURIComponent(s.replace(/\+/g, " "));
			};

			while (pair = tokenize.exec(this.queryString)) {
				urlParams[re_space(pair[1])] = re_space(pair[2]);
			}

			var base = 'https://www.parse.com';
			var id = urlParams['id'];
			
			this.$el.find('form').attr('action', base + '/apps/' + id + '/request_password_reset');
			this._in('username').val(urlParams['username']);
			this._in('token').val(urlParams['token']);


			if (urlParams['error']) {
				this._error(urlParams['error']);
			}

			return this;
		}

	});
	return ResetPasswordView;
});