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
	brl,
	brokerage,
	costs,
	date,
	dueDate,
	emoluments,
	rate,
	reason,
	settlementFee,
	taxes,
	type,
	unitPrice,
	usd,
	value,
}) => {
	const response = await server.post('/operations', {
		assetId,
		amount,
		brl,
		brokerage,
		costs,
		date,
		dueDate,
		emoluments,
		rate,
		reason,
		settlementFee,
		taxes,
		type,
		unitPrice,
		usd,
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

export const onGetLastPriceCryptos = async (description) => {
	let ticker;
	if (description === 'Bitcoin') ticker = 'BTC';
	else if (description === 'Ethereum') ticker = 'ETH';
	else if (description === 'Litecoin') ticker = 'LTC';
	else if (description === 'ChainLink') ticker = 'LINK';

	const response = await alphavantage.get(
		'&function=CURRENCY_EXCHANGE_RATE&from_currency=' +
			ticker +
			'&to_currency=BRL'
	);
	const objectKey = 'Realtime Currency Exchange Rate';
	const lastPrice = Number(response.data[objectKey]['5. Exchange Rate']);

	console.log('last price ' + ticker + '/BRL: ' + lastPrice);
	return lastPrice;
};

export const onGetLastPriceDollar = async () => {
	const response = await alphavantage.get(
		'&function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=BRL'
	);
	const objectKey = 'Realtime Currency Exchange Rate';
	const lastPrice = Number(response.data[objectKey]['5. Exchange Rate']);

	console.log('last price usd/brl: ' + lastPrice);
	return lastPrice;
};
