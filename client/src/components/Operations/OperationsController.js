import server from '../../apis/server';
import alphavantage from '../../apis/alphavantage';

export const onDeleteOperations = async (_id) => {
	await server.delete('/operations/' + _id);
};

export const onGetOperations = async (assetId) => {
	const response = await server.get(
		'/operations?$orderby=date &$filter=assetId $eq ' + assetId
	);
	return response.data;
};

export const onPostOperations = async ({
	assetId,
	amount,
	brokerage,
	costs,
	date,
	dueDate,
	emoluments,
	iof,
	reason,
	settlementFee,
	type,
	unitPrice,
	value,
}) => {
	const response = await server.post('/operations', {
		assetId,
		amount,
		brokerage,
		costs,
		date,
		dueDate,
		emoluments,
		iof,
		reason,
		settlementFee,
		type,
		unitPrice,
		value,
	});
	return response.data;
};

export const onGetLastPrice = async (ticker) => {
	const response = await alphavantage.get(
		'&function=TIME_SERIES_DAILY&symbol=' + ticker
	);
	const dailyTimeSeriesKey = 'Time Series (Daily)';
	const lastDayUpdated = response.data['Meta Data']['3. Last Refreshed'];
	const closeKey = '4. close';

	const lastPrice = Number(
		response.data[dailyTimeSeriesKey][lastDayUpdated][closeKey]
	);
	console.log(
		'last price: ' + lastPrice + ' last day updated: ' + lastDayUpdated
	);
	return lastPrice;
};

export const onGetLastPriceBitcoin = async () => {
	const response = await alphavantage.get(
		'&function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=BRL'
	);
	const objectKey = 'Realtime Currency Exchange Rate';
	const lastPrice = response.data[objectKey]['6. Last Refreshed'];

	console.log('last price btc/brl: ' + lastPrice);
	return lastPrice;
};
