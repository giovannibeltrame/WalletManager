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
	TOTAL_APPLIED,
	TOTAL_RESCUED,
	TOTAL_YIELD,
	TOTAL_COSTS,
	TOTAL_AMOUNT,
	GROSS_BALANCE,
	RESULT,
	PERCENTAGE_RESULT,
	AVERAGE_PRICE,
	APPLICATION,
	RESCUE,
	DIVIDEND,
	JSCP,
	SOLD_SUBSCRIPTION,
} from '../../constants';
import {
	numberToDecimal,
	numberToReais,
	numberToPercentage,
	sumTotalApplied,
	sumTotalRescued,
	sumTotalAmount,
	sumTotalYield,
	calcAveragePrice,
	calcResult,
	sumAllCosts,
} from '../../utils';

class VariableIncomeOperations extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			operations: [],
			amount: null,
			brokerage: null,
			costs: null,
			date: '',
			emoluments: null,
			reason: '',
			settlementFee: null,
			taxes: null,
			type: '',
			unitPrice: null,
			value: null,
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

	handleChangeAmount = (event, maskedvalue, floatvalue) => {
		this.setState({
			amount: floatvalue,
			value: floatvalue * this.state.unitPrice,
		});
	};

	handleChangeBrokerage = (event, maskedvalue, floatvalue) => {
		this.setState({
			brokerage: floatvalue,
			costs:
				floatvalue +
				this.state.emoluments +
				this.state.taxes +
				this.state.settlementFee,
		});
	};

	handleChangeDate = (event) => {
		this.setState({
			date: event.target.value,
		});
	};

	handleChangeEmoluments = (event, maskedvalue, floatvalue) => {
		this.setState({
			emoluments: floatvalue,
			costs:
				this.state.brokerage +
				floatvalue +
				this.state.taxes +
				this.state.settlementFee,
		});
	};

	handleChangeTaxes = (event, maskedvalue, floatvalue) => {
		this.setState({
			taxes: floatvalue,
			costs:
				this.state.brokerage +
				this.state.emoluments +
				floatvalue +
				this.state.settlementFee,
		});
	};

	handleChangeReason = (event) => {
		this.setState({
			reason: event.target.value,
		});
	};

	handleChangeSettlementFee = (event, maskedvalue, floatvalue) => {
		this.setState({
			settlementFee: floatvalue,
			costs:
				this.state.brokerage +
				this.state.emoluments +
				this.state.taxes +
				floatvalue,
		});
	};

	handleChangeType = (event) => {
		this.setState({
			type: event.target.value,
		});
	};

	handleChangeUnitPrice = (event, maskedvalue, floatvalue) => {
		this.setState({
			unitPrice: floatvalue,
			value: floatvalue * this.state.amount,
		});
	};

	handleChangeValue = (event, maskedvalue, floatvalue) => {
		this.setState({
			value: floatvalue,
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

	renderTotalRescued = (totalRescued) => {
		return (
			<div>
				<Badge variant='warning' className='w-50 mr-2'>
					{TOTAL_RESCUED}
				</Badge>
				<span>{numberToReais(totalRescued)}</span>
			</div>
		);
	};

	renderTotalYield = (totalYield) => {
		return (
			<div>
				<Badge variant='primary' className='w-50 mr-2'>
					{TOTAL_YIELD}
				</Badge>
				<span>{numberToReais(totalYield)}</span>
			</div>
		);
	};

	renderTotalAmount = (totalAmount) => {
		return (
			<div>
				<Badge variant='secondary' className='w-50 mr-2'>
					{TOTAL_AMOUNT}
				</Badge>
				<span>{numberToDecimal(totalAmount)}</span>
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
				<span>{numberToReais(averagePrice)}</span>
			</div>
		);
	};

	renderGrossBalance = (grossBalance) => {
		return (
			<div>
				<Badge variant='dark' className='w-50 mr-2'>
					{GROSS_BALANCE}
				</Badge>
				<span>{numberToReais(grossBalance)}</span>
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
				dataField: 'unitPrice',
				align: 'right',
				text: 'Preço Unitário',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					row.unitPrice ? numberToReais(row.unitPrice) : '-',
			},
			{
				dataField: 'amount',
				align: 'right',
				text: 'Quantidade',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					row.amount ? numberToDecimal(row.amount) : '-',
			},
			{
				dataField: 'value',
				align: 'right',
				text: 'Valor total',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToReais(row.value),
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
								<b>Taxa de liquidação: </b>
								{numberToReais(row.settlementFee)}
							</small>
						</div>
						<div>
							<small>
								<b>Emolumentos: </b>
								{numberToReais(row.emoluments)}
							</small>
						</div>
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
					<Col>
						<div>
							<small>
								<b>Motivos: </b>
								{row.reason.split('\n').map((i, key) => {
									return <div key={key}>{i}</div>;
								})}
							</small>
						</div>
					</Col>
				</Row>
			),
		};
	}

	render() {
		const { asset } = this.props;
		const totalApplied = sumTotalApplied(this.state.operations);
		const totalRescued = sumTotalRescued(this.state.operations);
		const totalYield = sumTotalYield(this.state.operations);
		const totalAmount = sumTotalAmount(this.state.operations);
		const totalCosts = sumAllCosts(this.state.operations);
		const averagePrice = calcAveragePrice(this.state.operations);
		const grossBalance = totalAmount * asset.lastUnitPrice;
		const result = calcResult(
			grossBalance,
			totalApplied,
			totalRescued,
			totalAmount,
			totalYield,
			totalCosts
		);
		const percentageResult = result / totalApplied;

		return (
			<Container>
				<h2 className='mt-5'>{asset.description}</h2>
				{asset.ticker && asset.lastUnitPrice ? (
					<h5 className='text-secondary'>
						{asset.ticker} - {numberToReais(asset.lastUnitPrice)}
					</h5>
				) : null}
				<h6 className='text-secondary'>{asset.broker}</h6>
				{this.renderMessage()}
				<Form onSubmit={this.handleSubmit} className='w-75 my-4'>
					<Form.Row>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Preço unitário'
								value={this.state.unitPrice}
								onChangeEvent={this.handleChangeUnitPrice}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
								disabled={
									this.state.type === DIVIDEND || this.state.type === JSCP
										? 'disabled'
										: ''
								}
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Quantidade'
								value={this.state.amount}
								onChangeEvent={this.handleChangeAmount}
								decimalSeparator=','
								thousandSeparator='.'
								disabled={
									this.state.type === DIVIDEND || this.state.type === JSCP
										? 'disabled'
										: ''
								}
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Valor total'
								value={this.state.value}
								onChangeEvent={this.handleChangeValue}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
								disabled={
									this.state.type === DIVIDEND || this.state.type === JSCP
										? ''
										: 'disabled'
								}
							/>
						</Col>

						<Col>
							<Form.Control as='select' custom onChange={this.handleChangeType}>
								<option />
								<option>{APPLICATION}</option>
								<option>{RESCUE}</option>
								<option>{DIVIDEND}</option>
								<option>{JSCP}</option>
								<option>{SOLD_SUBSCRIPTION}</option>
							</Form.Control>
						</Col>
					</Form.Row>
					<Form.Row className='mt-3'>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Taxa de liquidação'
								value={this.state.settlementFee}
								onChangeEvent={this.handleChangeSettlementFee}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
								disabled={
									this.state.type === DIVIDEND || this.state.type === JSCP
										? 'disabled'
										: ''
								}
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Emolumentos'
								value={this.state.emoluments}
								onChangeEvent={this.handleChangeEmoluments}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
								disabled={
									this.state.type === DIVIDEND || this.state.type === JSCP
										? 'disabled'
										: ''
								}
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Impostos'
								value={this.state.taxes}
								onChangeEvent={this.handleChangeTaxes}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
								disabled={
									this.state.type === DIVIDEND || this.state.type === JSCP
										? 'disabled'
										: ''
								}
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
								disabled={
									this.state.type === DIVIDEND || this.state.type === JSCP
										? 'disabled'
										: ''
								}
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
					</Form.Row>
					<Form.Row className='mt-3'>
						<Col>
							<Form.Control
								placeholder='Motivo'
								as='textarea'
								rows='3'
								onChange={this.handleChangeReason}
							/>
						</Col>
						<Col className='mt-4'>
							<Form.Control
								placeholder='Data'
								onChange={this.handleChangeDate}
								type='date'
							/>
						</Col>
						<Col className='mt-4'>
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

				<Row>
					<Col>
						{this.renderTotalApplied(totalApplied)}
						{this.renderTotalRescued(totalRescued)}
						{this.renderTotalYield(totalYield)}
						{this.renderTotalAmount(totalAmount)}
						{this.renderTotalCosts(totalCosts)}
					</Col>
					<Col>
						{this.renderGrossBalance(grossBalance)}
						{this.renderResult(result)}
						{this.renderPercentageResult(percentageResult)}
						{this.renderAveragePrice(averagePrice)}
					</Col>
				</Row>
			</Container>
		);
	}
}

export default VariableIncomeOperations;
