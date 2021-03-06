import * as Validate from "./validateData.js";
import axios from "axios";
import Websocket from "./websocket";
import { createHmac } from "crypto";

const Errors = {
	invalidField: new Error("Invalid Request Paramater")
};

export default class ByBit {
	constructor(key, secret, mainnet = false, timeout = 5000) {
		this.apiKey = key;
		this.apiSecret = secret;
		this.restUrl = mainnet ? "https://api.bybit.com" : "https://api-testnet.bybit.com";
		this.socketUrl = mainnet ? "wss://stream.bybit.com/realtime" : "wss://stream-testnet.bybit.com/realtime";
		this.axios = axios.create({
			baseURL: this.restUrl,
			timeout: timeout,
			headers: {
				"Content-Type": "application/json"
			}
		});
		this.websocket = null;
	}

	//Returns a HEX HMAC_SHA256 of the message
	_signMessage(message) {
		return createHmac("sha256", this.apiSecret)
			.update(message)
			.digest("hex");
	}

	// Calls functions to validate data, create message string, sign message and then submits/waits for response from ByBit API.
	_handleRequest(data = {}, url, type = "get") {
		return new Promise((resolve, reject) => {
			const timestamp = Date.now();
			let message = this._createMessage({ ...data, api_key: this.apiKey, timestamp });
			let signed = this._signMessage(message);
			let ordered = this._sortObj(data);
			let parameters = { api_key: this.apiKey, ...ordered, timestamp, sign: signed };
			this.axios({ method: type, url: url, params: parameters })
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(this._handleRequestError(error));
				});
		});
	}
	_sortObj(data) {
		const ordered = {};
		Object.keys(data)
			.sort()
			.forEach(function(key) {
				ordered[key] = data[key];
			});
		return ordered;
	}
	_handleRequestError(error) {
		if (error.response) {
			console.log(error.response.data);
			console.log(error.response.status);
			console.log(error.response.headers);
		} else if (error.request) {
			console.log(error.request);
		} else {
			console.log("Error", error.message);
		}
		return error;
	}

	_createMessage(data) {
		return Object.keys(data)
			.map((key) => key + "=" + data[key])
			.sort()
			.join("&");
	}

	placeActiveOrder(data) {
		return new Promise((resolve, reject) => {
			if (Validate.placeActiveOrder(data)) {
				this._handleRequest(data, "/open-api/order/create", "post")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	getActiveOrders(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getActiveOrders(data)) {
				this._handleRequest(data, "/open-api/order/list")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	cancelActiveOrder(data) {
		return new Promise((resolve, reject) => {
			if (Validate.cancelActiveOrder(data)) {
				this._handleRequest(data, "/open-api/order/cancel", "post")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	placeConditionalOrder(data) {
		return new Promise((resolve, reject) => {
			if (Validate.placeConditionalOrder(data)) {
				this._handleRequest(data, "/open-api/stop-order/create", "post")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	getConditionalOrders(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getConditionalOrders(data)) {
				this._handleRequest(data, "/open-api/stop-order/list")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	cancelConditionalOrder(data) {
		return new Promise((resolve, reject) => {
			if (Validate.cancelConditionalOrder(data)) {
				this._handleRequest(data, "/open-api/stop-order/cancel", "post")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	getLeverage(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getLeverage(data)) {
				this._handleRequest(data, "/user/leverage")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	updateLeverage(data) {
		return new Promise((resolve, reject) => {
			if (Validate.updateLeverage(data)) {
				this._handleRequest(data, "/user/leverage/save", "post")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	getPositions(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getLeverage(data)) {
				this._handleRequest(data, "/position/list")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	updatePositionMargin(data) {
		return new Promise((resolve, reject) => {
			if (Validate.updatePositionMargin(data)) {
				this._handleRequest(data, "/position/change-position-margin", "post")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	getFundingRate(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getFundingRate(data)) {
				this._handleRequest(data, "/open-api/funding/prev-funding-rate")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	getPrevFundingRate(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getPrevFundingRate(data)) {
				this._handleRequest(data, "/open-api/funding/prev-funding")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	getNextFundingRate(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getNextFundingRate(data)) {
				this._handleRequest(data, "/open-api/funding/predicted-funding")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	getOrderInfo(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getOrderInfo(data)) {
				this._handleRequest(data, "/v2/private/execution/list")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}

	getSymbols(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getSymbols(data)) {
				this._handleRequest(data, "v2/public/symbols")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}
	getKline(data) {
		return new Promise((resolve, reject) => {
			if (Validate.getKline(data)) {
				this._handleRequest(data, "v2/public/kline/list")
					.then(resolve)
					.catch(reject);
			} else {
				reject(Errors.invalidField);
			}
		});
	}
}
