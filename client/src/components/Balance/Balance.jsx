import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { ResponsivePie } from '@nivo/pie';

import { onGetAssets, onPutAssets } from '../Assets/AssetsController';
import {
	onGetOperations,
	onGetLastPrice,
	onGetLastPriceBitcoin,
	onGetLastPriceDollar,
} from '../Operations/OperationsController';

import {
	ACAO,
	BITCOIN,
	FUNDO_IMOBILIARIO,
	OURO,
	PRATA,
	USA,
} from '../constants';
import {
	numberToDecimal,
	numberToReais,
	numberToDollars,
	numberToPercentage,
	sumTotalAmount,
	groupBy,
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
			assets: assets.filter((item) => item),
		});
	};

	async componentDidMount() {
		this.refreshAssets();
	}

	mapClassesToData = () => {
		let response = [];
		const totalGrossBalance = this.state.assets.reduce(
			(acc, asset) => acc + asset.grossBalance,
			0
		);
		const assetClassMap = groupBy(
			this.state.assets,
			(asset) => asset.assetClass
		);

		assetClassMap.forEach((value, key) => {
			const assetClassGrossBalance = value.reduce(
				(acc, asset) => acc + asset.grossBalance,
				0
			);
			response.push({
				id: key,
				value: assetClassGrossBalance / totalGrossBalance,
				assetClassGrossBalance: assetClassGrossBalance,
				label: key,
			});
		});

		return response;
	};

	handleCallService = async (asset) => {
		let lastUnitPrice,
			lastPriceDollar = 1;
		const { _id, assetClass, description, lastAmount, ticker } = asset;
		const lastRefreshedDate = new Date();

		try {
			if (description !== 'Caixa USD') {
				switch (assetClass) {
					case BITCOIN:
						lastUnitPrice = await onGetLastPriceBitcoin();
						break;
					case ACAO:
					case FUNDO_IMOBILIARIO:
						lastUnitPrice = await onGetLastPrice(ticker + '.SA');
						break;
					case USA:
					case OURO:
					case PRATA:
						lastUnitPrice = await onGetLastPrice(ticker);
						lastPriceDollar = await onGetLastPriceDollar();
						break;
					default:
						return;
				}

				const assetOperations = await onGetOperations(_id);
				const lastAmount = sumTotalAmount(assetOperations);
				const grossBalance = lastAmount * lastUnitPrice * lastPriceDollar;

				await onPutAssets({
					_id,
					lastUnitPrice,
					lastAmount,
					grossBalance,
					lastRefreshedDate,
				});
			} else {
				lastUnitPrice = await onGetLastPriceDollar();
				const grossBalance = lastAmount * lastUnitPrice;

				await onPutAssets({
					_id,
					lastUnitPrice,
					grossBalance,
					lastRefreshedDate,
				});
			}
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
					return row.currency === 'USD' && row.description !== 'Caixa USD'
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
				formatter: (cell, row, rowIndex, formatExtraData) => {
					if (!row.grossBalance) return '-';
					return numberToReais(row.grossBalance);
				},
				footer: (columnData) => {
					return numberToReais(
						columnData.reduce((acc, row) => {
							if (!row) return acc;
							return acc + row;
						}, 0)
					);
				},
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

		const percentageColumns = [
			{
				dataField: 'label',
				text: 'Classe de ativo',
				footer: 'TOTAL',
			},
			{
				dataField: 'value',
				text: '%',
				formatter: (cell, row, rowIndex, formatExtraData) => {
					return numberToPercentage(row.value);
				},
				footer: (columnData) => {
					return numberToPercentage(
						columnData.reduce((acc, row) => acc + row, 0)
					);
				},
			},
			{
				dataField: 'assetClassGrossBalance',
				text: 'Saldo bruto',

				formatter: (cell, row, rowIndex, formatExtraData) => {
					return numberToReais(row.assetClassGrossBalance);
				},
				footer: (columnData) => {
					return numberToReais(columnData.reduce((acc, row) => acc + row, 0));
				},
			},
		];
		return (
			<Container>
				<Row>
					<BootstrapTable
						hover
						keyField='_id'
						data={this.state.assets}
						columns={columns}
						cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
					/>
				</Row>
				<Row style={{ height: 500 }}>
					<Col>
						<ResponsivePie
							colors={{ scheme: 'accent' }}
							margin={{ top: 40, right: 120, bottom: 40, left: 120 }}
							data={this.mapClassesToData()}
							innerRadius={0.3}
							padAngle={1}
							radialLabel={'label'}
							radialLabelsLinkStrokeWidth={1}
							// enableRadialLabels={false}
							enableSlicesLabels={false}
							tooltipFormat={(value) => numberToPercentage(value)}
						/>
					</Col>
					<Col>
						<BootstrapTable
							hover
							keyField='id'
							data={this.mapClassesToData()}
							columns={percentageColumns}
						/>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Balance;
