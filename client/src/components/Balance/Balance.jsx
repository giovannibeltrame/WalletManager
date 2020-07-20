import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Button, Container } from 'react-bootstrap';

import { onGetAssets, onPutAssets } from '../Assets/AssetsController';
import {
	onGetLastPrice,
	onGetLastPriceBitcoin,
	onGetOperations,
} from '../Operations/OperationsController';

import { ACAO, BITCOIN, FUNDO_IMOBILIARIO } from '../constants';
import {
	numberToDecimal,
	numberToReais,
	numberToDollars,
	sumTotalAmount,
} from '../utils';

class Balance extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			assets: [],
		};
	}

	refreshAssets = async () => {
		const assets = await onGetAssets();
		this.setState({
			assets: assets.filter((item) => item.grossBalance),
		});
	};

	async componentDidMount() {
		this.refreshAssets();
	}

	handleCallService = async (asset) => {
		let lastUnitPrice;
		const { _id, assetClass, ticker } = asset;
		try {
			if (assetClass === BITCOIN) lastUnitPrice = await onGetLastPriceBitcoin();
			const tickerService =
				assetClass === ACAO || assetClass === FUNDO_IMOBILIARIO
					? ticker + '.SA'
					: ticker;
			lastUnitPrice = await onGetLastPrice(tickerService);

			const assetOperations = await onGetOperations(_id);
			const lastAmount = sumTotalAmount(assetOperations);
			const grossBalance = lastAmount * lastUnitPrice;

			const lastRefreshedDate = new Date();
			await onPutAssets({
				_id,
				lastUnitPrice,
				lastAmount,
				grossBalance,
				lastRefreshedDate,
			});
			this.refreshAssets();
		} catch (error) {
			console.error(error);
		}
	};

	render() {
		const columns = [
			{
				dataField: 'ticker',
				text: 'Ticker',
				footerAlign: 'right',
				editable: false,
				formatter: (cell, row, rowIndex, formatExtraData) =>
					row.ticker || row.description,
				footer: 'TOTAL',
			},
			{
				dataField: 'lastUnitPrice',
				text: 'Último Preço',
				align: 'right',
				editable: false,
				formatter: (cell, row, rowIndex, formatExtraData) => {
					if (!row.lastUnitPrice) return '-';
					return row.currency === 'USD'
						? numberToDollars(row.lastUnitPrice)
						: numberToReais(row.lastUnitPrice);
				},
				footer: '',
			},
			{
				dataField: 'lastAmount',
				text: 'Quantidade',
				align: 'right',
				editable: false,
				formatter: (cell, row, rowIndex, formatExtraData) =>
					row.lastAmount ? numberToDecimal(row.lastAmount) : '-',
				footer: '',
			},
			{
				dataField: 'grossBalance',
				text: 'Saldo Bruto',
				align: 'right',
				footerAlign: 'right',
				editable: false,
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToReais(row.grossBalance),
				footer: (columnData) =>
					numberToReais(columnData.reduce((acc, row) => acc + row, 0)),
			},
			{
				dataField: 'lastRefreshedDate',
				text: 'Última Atualização',
				align: 'right',
				editable: false,
				formatter: (cell, row, rowIndex, formatExtraData) =>
					row.lastRefreshedDate
						? new Date(row.lastRefreshedDate).toLocaleDateString('pt-BR', {
								dateStyle: 'short',
								timeStyle: 'short',
						  })
						: '',
				footer: '',
			},
			{
				dataField: 'actions',
				text: 'Ações',
				align: 'center',
				editable: false,
				isDummyField: true,
				formatter: (cell, row, rowIndex, formatExtraData) => (
					<Button
						variant='outline-success'
						size='sm'
						onClick={() => this.handleCallService(row)}
					>
						Atualizar
					</Button>
				),
				footer: '',
			},
		];
		return (
			<Container>
				<BootstrapTable
					hover
					keyField='_id'
					data={this.state.assets}
					columns={columns}
					cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
				/>
			</Container>
		);
	}
}

export default Balance;
