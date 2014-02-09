// Get elements
var 
	nameInput = document.querySelector('.usr-name'),
	form = document.querySelector('#myform');

var saveName;
saveName = function() {
	console.log('run');
	var usrName = nameInput.value;
	CookieUtil.create('username', usrName, 7);
};

window.onload = (EventUtil.addHandler(form, 'submit', saveName));