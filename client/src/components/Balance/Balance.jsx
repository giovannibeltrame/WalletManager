import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { ResponsivePie } from '@nivo/pie';

import history from '../history';
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
	numberToPercentage,
	numberToReais,
	numberToDollars,
	sumAllCosts,
	sumTotalAmount,
	sumTotalApplied,
	sumTotalAppliedUSD,
	sumTotalRescued,
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

	mapAssetsToData = () => {
		const totalGrossBalance = this.state.assets.reduce(
			(acc, asset) => acc + asset.grossBalance,
			0
		);

		const response = this.state.assets.map((asset) => ({
			id: asset._id,
			value: asset.grossBalance / totalGrossBalance,
			label: asset.description,
			assetClass: asset.assetClass,
		}));

		return response;
	};

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
				assetClassGrossBalance,
				label: key,
			});
		});

		return response;
	};

	updateLastUnitPrice = async (asset) => {
		let lastUnitPrice,
			lastPriceDollar = 1;
		const { _id, assetClass, description, lastAmount, ticker } = asset;
		const lastRefreshedDate = new Date();

		try {
			if (description !== 'Caixa USD') {
				const assetOperations = await onGetOperations(_id);
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
		} catch (error) {
			console.error(error);
		}
	};

	updateTotalAppliedWithCosts = async (asset) => {
		const { _id, assetClass, description, lastAmount } = asset;
		const lastRefreshedDate = new Date();

		try {
			const assetOperations = await onGetOperations(_id);
			let totalAppliedWithCosts;

			switch (assetClass) {
				case USA:
				case OURO:
				case PRATA:
					if (description !== 'Caixa USD') return;
					totalAppliedWithCosts =
						sumTotalAppliedUSD(assetOperations) + sumAllCosts(assetOperations);

					await onPutAssets({
						_id,
						totalAppliedWithCosts,
						lastRefreshedDate,
					});
					break;

				default:
					if (lastAmount === 0) totalAppliedWithCosts = 0;
					else
						totalAppliedWithCosts =
							sumTotalApplied(assetOperations) -
							sumTotalRescued(assetOperations) +
							sumAllCosts(assetOperations);

					await onPutAssets({
						_id,
						totalAppliedWithCosts,
						lastRefreshedDate,
					});
					break;
			}
		} catch (error) {
			console.error(error);
		}
	};

	handleCallService = async (asset) => {
		await this.updateLastUnitPrice(asset);
		await this.updateTotalAppliedWithCosts(asset);
		this.refreshAssets();
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
				dataField: 'totalAppliedWithCosts',
				text: 'Total aplicado com custos',
				align: 'right',
				footerAlign: 'right',
				editable: false,
				formatter: (cell, row, rowIndex, formatExtraData) => {
					if (!row.totalAppliedWithCosts) return '-';
					return numberToReais(row.totalAppliedWithCosts);
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
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit',
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
				text: 'Ativo',
				footer: 'TOTAL',
				sort: true,
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
				sort: true,
			},
			{
				dataField: 'assetClass',
				text: 'Classe de ativo',
				footer: '',
				sort: true,
			},
		];

		const { assets } = this.state;

		return (
			<Container>
				<Button
					variant='outline-primary'
					onClick={() => history.push('/classes', this.mapClassesToData())}
				>
					Go to Classes
				</Button>
				<Row>
					<BootstrapTable
						hover
						keyField='_id'
						data={assets}
						columns={columns}
						cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
					/>
				</Row>

				<Row className='mt-5' style={{ height: 500 }}>
					<Col>
						<BootstrapTable
							hover
							keyField='id'
							data={this.mapAssetsToData()}
							columns={percentageColumns}
							defaultSorted={[{ dataField: 'label', order: 'asc' }]}
						/>
					</Col>
					<Col>
						<ResponsivePie
							colors={{ scheme: 'accent' }}
							margin={{ top: 40, right: 120, bottom: 40, left: 120 }}
							data={this.mapAssetsToData()}
							innerRadius={0.3}
							padAngle={1}
							radialLabel={'label'}
							radialLabelsLinkStrokeWidth={1}
							enableSlicesLabels={false}
							tooltipFormat={(value) => numberToPercentage(value)}
						/>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Balance;
