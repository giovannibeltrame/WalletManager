import React from 'react';
import {
	Alert,
	Badge,
	Button,
	Col,
	Container,
	Form,
	Row,
} from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import BootstrapTable from 'react-bootstrap-table-next';

import { onPutAssets } from '../../Assets/AssetsController';
import {
	onPostOperations,
	onGetOperations,
	onDeleteOperations,
} from '../OperationsController';

import {
	ADD_OPERATION_SUCCESS,
	ADD_OPERATION_ERROR,
	DELETE_OPERATION_SUCCESS,
	DELETE_OPERATION_ERROR,
	REFRESH_LAST_AMOUNT_SUCCESS,
	REFRESH_LAST_AMOUNT_ERROR,
	TOTAL_APPLIED,
	TOTAL_APPLIED_DOLLARS,
	TOTAL_APPLIED_NOW,
	TOTAL_COSTS,
	TOTAL_AMOUNT,
	RESULT,
	PERCENTAGE_RESULT,
	AVERAGE_PRICE,
	APPLICATION,
	RESCUE,
} from '../../constants';
import {
	numberToDollars,
	numberToPercentage,
	numberToReais,
	numberToReais4Digits,
	sumAllCosts,
	sumTotalAppliedUSD,
} from '../../utils';

class CurrencyOperations extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			operations: [],
			brl: null,
			brokerage: null,
			costs: null,
			date: '',
			lastAmount: null,
			rate: null,
			taxes: null,
			type: '',
			usd: null,
			message: '',
			variantMessage: '',
		};
	}

	async componentDidMount() {
		const { _id } = this.props.asset;
		const operations = await onGetOperations(_id);

		this.setState({
			operations,
		});
	}

	handleSubmit = async (event) => {
		event.preventDefault();
		const _id = this.props.asset._id;
		try {
			await onPostOperations({ ...this.state, assetId: _id });
			this.setState({
				message: ADD_OPERATION_SUCCESS,
				variantMessage: 'success',
				operations: await onGetOperations(_id),
			});
		} catch {
			this.setState({
				message: ADD_OPERATION_ERROR,
				variantMessage: 'danger',
			});
		}
	};

	handleSubmitLastAmount = async (event) => {
		event.preventDefault();
		const { _id } = this.props.asset;
		const { lastAmount } = this.state;

		try {
			await onPutAssets({
				_id,
				lastAmount,
			});
			this.setState({
				message: REFRESH_LAST_AMOUNT_SUCCESS,
				variantMessage: 'success',
			});
		} catch {
			this.setState({
				message: REFRESH_LAST_AMOUNT_ERROR,
				variantMessage: 'danger',
			});
		}
	};

	handleChangeBRL = (event, maskedvalue, floatvalue) => {
		this.setState({
			brl: floatvalue,
		});
	};

	handleChangeBrokerage = (event, maskedvalue, floatvalue) => {
		this.setState({
			brokerage: floatvalue,
			costs: floatvalue + this.state.taxes,
		});
	};

	handleChangeDate = (event) => {
		this.setState({
			date: event.target.value,
		});
	};

	handleChangeLastAmount = (event, maskedvalue, floatvalue) => {
		this.setState({
			lastAmount: floatvalue,
		});
	};

	handleChangeRate = (event, maskedvalue, floatvalue) => {
		this.setState({
			rate: floatvalue,
		});
	};

	handleChangeTaxes = (event, maskedvalue, floatvalue) => {
		this.setState({
			taxes: floatvalue,
			costs: this.state.brokerage + floatvalue,
		});
	};

	handleChangeType = (event) => {
		this.setState({
			type: event.target.value,
		});
	};

	handleChangeUSD = (event, maskedvalue, floatvalue) => {
		this.setState({
			usd: floatvalue,
		});
	};

	handleDelete = async (_id) => {
		try {
			await onDeleteOperations(_id);
			this.setState({
				message: DELETE_OPERATION_SUCCESS,
				variantMessage: 'warning',
				operations: await onGetOperations(this.props.asset._id),
			});
		} catch {
			this.setState({
				message: DELETE_OPERATION_ERROR,
				variantMessage: 'danger',
			});
		}
	};

	renderMessage = () => {
		return this.state.message ? (
			<Alert className='w-75 mt-3' variant={this.state.variantMessage}>
				{this.state.message}
			</Alert>
		) : null;
	};

	renderTotalApplied = (totalApplied) => {
		return (
			<div>
				<Badge variant='info' className='w-50 mr-2'>
					{TOTAL_APPLIED}
				</Badge>
				<span>{numberToReais(totalApplied)}</span>
			</div>
		);
	};

	renderTotalAppliedDollars = (totalApplied) => {
		return (
			<div>
				<Badge variant='primary' className='w-50 mr-2'>
					{TOTAL_APPLIED_DOLLARS}
				</Badge>
				<span>{numberToDollars(totalApplied)}</span>
			</div>
		);
	};

	renderTotalAppliedNow = (totalAppliedNow) => {
		return (
			<div>
				<Badge variant='dark' className='w-50 mr-2'>
					{TOTAL_APPLIED_NOW}
				</Badge>
				<span>{numberToReais(totalAppliedNow)}</span>
			</div>
		);
	};

	renderTotalAmount = (totalAmount) => {
		return (
			<div>
				<Badge variant='secondary' className='w-50 mr-2'>
					{TOTAL_AMOUNT}
				</Badge>
				<span>{numberToDollars(totalAmount)}</span>
			</div>
		);
	};

	renderTotalCosts = (totalCosts) => {
		return (
			<div>
				<Badge variant='danger' className='w-50 mr-2'>
					{TOTAL_COSTS}
				</Badge>
				<span>{numberToReais(totalCosts)}</span>
			</div>
		);
	};

	renderAveragePrice = (averagePrice) => {
		return (
			<div>
				<Badge variant='light' className='w-50 mr-2'>
					{AVERAGE_PRICE}
				</Badge>
				<span>{numberToReais4Digits(averagePrice)}</span>
			</div>
		);
	};

	renderResult = (result) => {
		const variant = result > 0 ? 'success' : 'danger';
		return (
			<div>
				<Badge variant={variant} className='w-50 mr-2'>
					{RESULT}
				</Badge>
				<span>{numberToReais(result)}</span>
			</div>
		);
	};

	renderPercentageResult = (percentageResult) => {
		const variant = percentageResult > 0 ? 'success' : 'danger';
		return (
			<div>
				<Badge variant={variant} className='w-50 mr-2'>
					{PERCENTAGE_RESULT}
				</Badge>
				<span>{numberToPercentage(percentageResult)}</span>
			</div>
		);
	};

	getTableColumns() {
		return [
			{
				dataField: 'date',
				align: 'right',
				text: 'Data',
				formatter: (cell, row, rowIndex, formatExtraData) => {
					const dateSplit = row.date.split('-');
					return new Date(
						dateSplit[0],
						dateSplit[1] - 1,
						dateSplit[2]
					).toLocaleDateString('pt-BR');
				},
			},
			{
				dataField: 'brl',
				align: 'right',
				text: 'Reais',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToReais(row.brl),
			},
			{
				dataField: 'usd',
				align: 'right',
				text: 'Dólares',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToDollars(row.usd),
			},
			{
				dataField: 'rate',
				align: 'right',
				text: 'Valor câmbio',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToReais4Digits(row.rate),
			},
			{
				dataField: 'type',
				text: 'Tipo',
			},
			{
				dataField: 'actions',
				align: 'center',
				text: 'Excluir',
				isDummyField: true,
				formatter: (cell, row, rowIndex, formatExtraData) => (
					<Button
						variant='outline-danger'
						size='sm'
						onClick={() => this.handleDelete(row._id)}
					>
						Excluir
					</Button>
				),
			},
		];
	}

	expandRow() {
		return {
			renderer: (row) => (
				<Row>
					<Col>
						<div>
							<small>
								<b>Impostos: </b>
								{numberToReais(row.taxes)}
							</small>
						</div>
						<div>
							<small>
								<b>Corretagem: </b>
								{numberToReais(row.brokerage)}
							</small>
						</div>
						<div>
							<small>
								<b>Total em custos: </b>
								{numberToReais(row.costs)}
							</small>
						</div>
					</Col>
				</Row>
			),
		};
	}

	render() {
		const { asset } = this.props;

		const totalApplied = sumTotalAppliedUSD(this.state.operations);

		const totalDollars = this.state.operations.reduce(
			(accumulator, operation) => {
				if (operation.type === 'Aplicação') return accumulator + operation.usd;
				else return accumulator;
			},
			0
		);

		const totalAppliedNow = totalDollars * asset.lastUnitPrice;

		const totalCosts = sumAllCosts(this.state.operations);
		const averagePrice = totalApplied / totalDollars;
		const result = totalAppliedNow - totalApplied - totalCosts;
		const percentageResult = result / totalApplied;

		return (
			<Container>
				<h2 className='mt-5'>{asset.description}</h2>
				<h5 className='text-secondary'>{numberToReais(asset.lastUnitPrice)}</h5>
				<h6 className='text-secondary'>{asset.broker}</h6>
				{this.renderMessage()}
				<Form onSubmit={this.handleSubmit} className='w-75 my-4'>
					<Form.Row>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Reais'
								value={this.state.brl}
								onChangeEvent={this.handleChangeBRL}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Dólares'
								value={this.state.usd}
								onChangeEvent={this.handleChangeUSD}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='US$ '
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Valor câmbio'
								value={this.state.rate}
								onChangeEvent={this.handleChangeRate}
								decimalSeparator=','
								thousandSeparator='.'
								precision='4'
								prefix='R$ '
							/>
						</Col>

						<Col>
							<Form.Control as='select' custom onChange={this.handleChangeType}>
								<option />
								<option>{APPLICATION}</option>
								<option>{RESCUE}</option>
							</Form.Control>
						</Col>
					</Form.Row>
					<Form.Row className='mt-3'>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Impostos'
								value={this.state.taxes}
								onChangeEvent={this.handleChangeTaxes}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Corretagem'
								value={this.state.brokerage}
								onChangeEvent={this.handleChangeBrokerage}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Total de custos'
								value={this.state.costs}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
								disabled
							/>
						</Col>
						<Col>
							<Form.Control
								placeholder='Data'
								onChange={this.handleChangeDate}
								type='date'
							/>
						</Col>
					</Form.Row>
					<Form.Row className='mt-3'>
						<Col>
							<Button variant='outline-primary' type='submit'>
								Incluir operação
							</Button>
						</Col>
					</Form.Row>
				</Form>

				<BootstrapTable
					hover
					bootstrap4
					keyField='_id'
					data={this.state.operations}
					columns={this.getTableColumns()}
					expandRow={this.expandRow()}
				/>

				<Row className='my-4'>
					<Form inline onSubmit={this.handleSubmitLastAmount}>
						<CurrencyInput
							className='form-control mx-3'
							placeholder='Saldo atual'
							value={this.state.lastAmount}
							onChangeEvent={this.handleChangeLastAmount}
							decimalSeparator=','
							thousandSeparator='.'
							prefix='US$ '
						/>
						<Button variant='outline-success' type='submit'>
							Atualizar
						</Button>
					</Form>
				</Row>

				<Row>
					<Col>
						{this.renderTotalApplied(totalApplied)}
						{this.renderTotalAppliedDollars(totalDollars)}
						{this.renderTotalAppliedNow(totalAppliedNow)}
						{this.renderTotalCosts(totalCosts)}
					</Col>
					<Col>
						{this.renderTotalAmount(asset.lastAmount)}
						{this.renderResult(result)}
						{this.renderPercentageResult(percentageResult)}
						{this.renderAveragePrice(averagePrice)}
					</Col>
				</Row>
			</Container>
		);
	}
}

export default CurrencyOperations;
