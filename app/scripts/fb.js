define(['facebook'], function(){

	if( typeof FB !== typeof undefined) {
		FB.init({
			appId      : '1446014202368406',
			status     : true,
			xfbml      : false
		});
	}

});