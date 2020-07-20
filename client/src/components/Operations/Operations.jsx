import React from 'react';

import FixIncomeOperations from './components/FixIncomeOperations';
import VariableIncomeOperations from './components/VariableIncomeOperations';

import {
	ACAO,
	BITCOIN,
	FUNDO_IMOBILIARIO,
	OURO,
	PRATA,
	PREVIDENCIA_PRIVADA,
	RENDA_FIXA,
	USA,
} from '../constants';

class Operations extends React.Component {
	render() {
		const { state: asset } = this.props.location;

		debugger;
		switch (asset.assetClass) {
			case ACAO:
			case FUNDO_IMOBILIARIO:
			case BITCOIN:
				return <VariableIncomeOperations asset={asset} />;
			case RENDA_FIXA:
			case PREVIDENCIA_PRIVADA:
				return <FixIncomeOperations asset={asset} />;
			case USA:
			case OURO:
			case PRATA:
				return '';
			default:
				return;
		}
	}
}

export default Operations;
