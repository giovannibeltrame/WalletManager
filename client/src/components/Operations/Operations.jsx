import React from 'react';

import BitcoinOperations from './components/BitcoinOperations';
import FixIncomeOperations from './components/FixIncomeOperations';
import InternationalOperations from './components/InternationalOperations';
import VariableIncomeOperations from './components/VariableIncomeOperations';

import {
	ACAO,
	CRIPTO,
	FUNDO_IMOBILIARIO,
	OURO,
	PRATA,
	PREVIDENCIA_PRIVADA,
	RENDA_FIXA,
	USA,
	USD,
	ALL_WORLD,
	BONDS,
	TREASURY,
	TECH,
} from '../constants';

class Operations extends React.Component {
	render() {
		const { state: asset } = this.props.location;

		switch (asset.assetClass) {
			case ACAO:
			case FUNDO_IMOBILIARIO:
				return <VariableIncomeOperations asset={asset} />;
			case CRIPTO:
				return <BitcoinOperations asset={asset} />;
			case RENDA_FIXA:
			case PREVIDENCIA_PRIVADA:
				return <FixIncomeOperations asset={asset} />;
			case USA:
			case USD:
			case OURO:
			case PRATA:
			case ALL_WORLD:
			case BONDS:
			case TREASURY:
			case TECH:
				return <InternationalOperations asset={asset} />;
			default:
				return;
		}
	}
}

export default Operations;
