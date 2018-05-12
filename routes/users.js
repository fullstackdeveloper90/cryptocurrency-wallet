var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var fireadmin = require('firebase-admin');
var stripe = require('stripe')('sk_test_sHUm7uzXI2eJRZb92Gb29VaR');

var serviceAccount = require("./my-wallet-d5bb3-firebase-adminsdk-gw288-9d0720503a.json");

fireadmin.initializeApp({
	credential: fireadmin.credential.cert(serviceAccount),
	databaseURL: "https://my-wallet-d5bb3.firebaseio.com",
	storageBucket: "my-wallet-d5bb3.appspot.com"
});

/* GET users listing. */
function register (req, res) {
	let dataObject = req.body;

	console.log('data: ', dataObject);

	let email = dataObject.email;
	let firstname = dataObject.firstname;
	let lastname = dataObject.lastname;
	let password = dataObject.password;
	let phone = dataObject.phone;

	fireadmin.auth().createUser({
		email: email,
		emailVerified: true,
		phoneNumber: phone,
		password: password,
		displayName: firstname + " " + lastname,
		disabled: false
	})
	.then(function(userRecord) {
		// See the UserRecord reference doc for the contents of userRecord.
		console.log("Successfully created new user:", userRecord.uid);
		return res.status(200).json({status: 'success', msg:'Signup successfully'});
	})
	.catch(function(error) {
		console.log("Error creating new user:", error);
		return res.status(400).json({status: 'failed', msg: error.massage});
	});
}

function signin (req, res) {
	let dataObject = req.body;

	console.log('data: ', dataObject);

	let email = dataObject.email;
	let password = dataObject.password;

	firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
		console.log(user);
		return res.status(200).json({status: 'success', msg:'Login successfully'});
	}).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// ...
		return res.status(200).json({status: 'success', msg: error.message});
	});
}

function charge (req, res) {
	let dataObject = req.body;
	console.log(dataObject);

	let customer = dataObject.customer;
	let amount = dataObject.amount;
	let currency = dataObject.currency.toLocaleLowerCase();
	let token = dataObject.token;

	stripe.charges.create({
		amount: amount,
		currency: currency,
		source: token
	}).then(function (result) {
		console.log(result);
		if (result.paid) {
			
			return res.status(200).json({
				status: 'success', 
				paid_data: result, 
				msg:'Paid successfully'
			});
		}
	}).catch(function(err) {
		// Deal with an error
		console.log(err);
	});
}

module.exports.register = register;
module.exports.signin = signin;
module.exports.charge = charge;
