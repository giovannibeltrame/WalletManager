import React from 'react';

import FixIncomeOperations from './components/FixIncomeOperations';
import VariableIncomeOperations from './components/VariableIncomeOperations';

class Operations extends React.Component {
	render() {
		const { state: asset } = this.props.location;

		if (asset.assetClass === 'Ações' || asset.assetClass === 'FIIs')
			return <VariableIncomeOperations asset={asset} />;
		else if (asset.assetClass === 'Renda Fixa')
			return <FixIncomeOperations asset={asset} />;
		else if (asset.assetClass === 'USA') return '';
	}
}

export default Operations;
