export const numberToDecimal = (number) => {
	if (!number) number = 0;
	return number.toLocaleString('pt-BR');
};

export const numberToDecimal8Digits = (number) => {
	if (!number) number = 0;
	return number.toLocaleString('pt-BR', {
		minimumFractionDigits: 8,
	});
};

export const numberToReais = (number) => {
	if (!number) number = 0;
	return number.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		minimumFractionDigits: 2,
	});
};

export const numberToReais4Digits = (number) => {
	if (!number) number = 0;
	return number.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		minimumFractionDigits: 4,
	});
};

export const numberToDollars = (number) => {
	if (!number) number = 0;
	return number.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
	});
};

export const numberToPercentage = (number) => {
	if (!number) number = 0;
	return number.toLocaleString('pt-BR', {
		style: 'percent',
		minimumFractionDigits: 2,
	});
};

export const sumTotalApplied = (operations) => {
	return operations.reduce((accumulator, operation) => {
		if (operation.type === 'Aplicação') return accumulator + operation.value;
		else return accumulator;
	}, 0);
};

export const sumTotalRescued = (operations) => {
	return operations.reduce((accumulator, operation) => {
		if (operation.type === 'Resgate') return accumulator + operation.value;
		else return accumulator;
	}, 0);
};

export const sumTotalAmount = (operations) => {
	return operations.reduce((accumulator, operation) => {
		if (operation.type === 'Resgate') return accumulator - operation.amount;
		else if (operation.type === 'Aplicação')
			return accumulator + operation.amount;
		else return accumulator;
	}, 0);
};

export const sumTotalYield = (operations) => {
	return operations.reduce((accumulator, operation) => {
		if (
			operation.type === 'Dividendo' ||
			operation.type === 'Juros Sobre Capital Próp.' ||
			operation.type === 'Venda de Direito de Subs.'
		)
			return accumulator + operation.value;
		else return accumulator;
	}, 0);
};

export const sumAllCosts = (operations) => {
	return operations.reduce(
		(accumulator, operation) => accumulator + operation.costs,
		0
	);
};

export const calcAveragePrice = (operations) => {
	const accumulator = operations.reduce(
		(accumulator, operation) => {
			if (operation.type === 'Aplicação') {
				let newAmount = accumulator.amount + operation.amount;
				let newAveragePrice =
					(accumulator.averagePrice * accumulator.amount +
						operation.value +
						operation.costs) /
					newAmount;

				accumulator.averagePrice = newAveragePrice;
				accumulator.amount = newAmount;
			} else if (operation.type === 'Resgate') {
				accumulator.amount = accumulator.amount - operation.amount;
				if (accumulator.amount === 0) {
					accumulator.averagePrice = 0;
				}
			}
			return accumulator;
		},
		{ amount: 0, averagePrice: 0 }
	);

	return accumulator.averagePrice;
};

export const calcResult = (
	grossBalance,
	totalApplied,
	totalRescued,
	totalAmount,
	totalYield,
	totalCosts
) => {
	if (totalAmount === 0) {
		return totalRescued - totalApplied + totalYield - totalCosts;
	} else {
		return grossBalance - totalApplied + totalRescued + totalYield - totalCosts;
	}
};

export const groupBy = (list, keyGetter) => {
	const map = new Map();
	list.forEach((item) => {
		const key = keyGetter(item);
		const collection = map.get(key);
		if (!collection) {
			map.set(key, [item]);
		} else {
			collection.push(item);
		}
	});
	return map;
};
