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

import { onPutAssets } from '../../AssetsController';
import {
	onPostOperations,
	onGetOperations,
	onDeleteOperations,
} from '../OperationsController';
import {
	numberToReais,
	numberToPercentage,
	sumTotalApplied,
	sumTotalRescued,
	sumAllCosts,
} from '../../utils';

class FixIncomeOperations extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			operations: [],
			brokerage: null,
			costs: null,
			date: '',
			dueDate: '',
			emoluments: null,
			grossBalance: null,
			reason: '',
			settlementFee: null,
			taxes: null,
			type: '',
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
		const { _id } = this.props.asset;
		try {
			await onPostOperations({ ...this.state, assetId: _id });
			this.setState({
				message: 'Operação incluída com sucesso!',
				variantMessage: 'success',
				operations: await onGetOperations(_id),
			});
		} catch {
			this.setState({
				message: 'Erro ao tentar incluir operação',
				variantMessage: 'danger',
			});
		}
	};

	handleSubmitGrossBalance = async (event) => {
		event.preventDefault();
		const { _id } = this.props.asset;
		const { grossBalance } = this.state;
		const lastRefreshedDate = new Date();
		try {
			await onPutAssets({
				_id,
				grossBalance,
				lastRefreshedDate,
			});
			this.setState({
				message: 'Saldo bruto atualizado com sucesso!',
				variantMessage: 'success',
			});
		} catch {
			this.setState({
				message: 'Erro ao tentar incluir operação',
				variantMessage: 'danger',
			});
		}
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

	handleChangeDueDate = (event) => {
		this.setState({
			dueDate: event.target.value,
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

	handleChangeGrossBalance = (event, maskedvalue, floatvalue) => {
		this.setState({
			grossBalance: floatvalue,
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

	handleChangeType = (event) => {
		this.setState({
			type: event.target.value,
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
				message: 'Operação excluída com sucesso!',
				variantMessage: 'warning',
				operations: await onGetOperations(this.props.asset._id),
			});
		} catch {
			this.setState({
				message: 'Erro ao tentar excluir operação',
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
				dataField: 'value',
				align: 'right',
				text: 'Valor',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToReais(row.value),
			},
			{
				dataField: 'type',
				text: 'Tipo',
			},
			{
				dataField: 'dueDte',
				align: 'right',
				text: 'Data de Vencimento',
				formatter: (cell, row, rowIndex, formatExtraData) => {
					if (!row.dueDate) return '-';
					const dateSplit = row.dueDate.split('-');
					return new Date(
						dateSplit[0],
						dateSplit[1] - 1,
						dateSplit[2]
					).toLocaleDateString('pt-BR');
				},
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

	renderTotalApplied = (totalApplied) => {
		return (
			<div>
				<Badge variant='info' className='w-50 mr-2'>
					VALOR APLICADO
				</Badge>
				<span>{numberToReais(totalApplied)}</span>
			</div>
		);
	};

	renderTotalRescued = (totalRescued) => {
		return (
			<div>
				<Badge variant='warning' className='w-50 mr-2'>
					VALOR RESGATADO
				</Badge>
				<span>{numberToReais(totalRescued)}</span>
			</div>
		);
	};

	renderTotalCosts = (totalCosts) => {
		return (
			<div>
				<Badge variant='danger' className='w-50 mr-2'>
					TOTAL EM CUSTOS
				</Badge>
				<span>{numberToReais(totalCosts)}</span>
			</div>
		);
	};

	renderGrossBalance = (grossBalance) => {
		return (
			<div>
				<Badge variant='dark' className='w-50 mr-2'>
					SALDO BRUTO
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
					RESULTADO
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
					RENTABILIDADE
				</Badge>
				<span>{numberToPercentage(percentageResult)}</span>
			</div>
		);
	};

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
				</Row>
			),
		};
	}

	render() {
		const { asset } = this.props;
		const totalApplied = sumTotalApplied(this.state.operations);
		const totalRescued = sumTotalRescued(this.state.operations);
		const totalCosts = sumAllCosts(this.state.operations);
		const result =
			asset.grossBalance - totalApplied + totalRescued - totalCosts;
		const percentageResult = result / totalApplied;

		return (
			<Container>
				<h2 className='mt-5'>{asset.description}</h2>
				<h6 className='text-secondary'>{asset.broker}</h6>
				{this.renderMessage()}
				<Form onSubmit={this.handleSubmit} className='w-75 my-4'>
					<Form.Row className='w-50'>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Valor'
								value={this.state.value}
								onChangeEvent={this.handleChangeValue}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
							/>
						</Col>
						<Col>
							<Form.Control as='select' custom onChange={this.handleChangeType}>
								<option />
								<option>Aplicação</option>
								<option>Resgate</option>
							</Form.Control>
						</Col>
					</Form.Row>
					<Form.Row className='w-75 mt-3'>
						<Col>
							<Form.Label>Data</Form.Label>
							<Form.Control
								placeholder='Data'
								onChange={this.handleChangeDate}
								type='date'
							/>
						</Col>
						<Col>
							<Form.Label>Data de Vencimento</Form.Label>
							<Form.Control
								placeholder='Data de Vencimento'
								onChange={this.handleChangeDueDate}
								type='date'
							/>
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
					</Form.Row>
					<Form.Row>
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

				<Row className='my-4'>
					<Form inline onSubmit={this.handleSubmitGrossBalance}>
						<CurrencyInput
							className='form-control mx-3'
							placeholder='Saldo bruto'
							value={this.state.grossBalance}
							onChangeEvent={this.handleChangeGrossBalance}
							decimalSeparator=','
							thousandSeparator='.'
							prefix='R$ '
						/>
						<Button variant='outline-success' type='submit'>
							Atualizar
						</Button>
					</Form>
				</Row>

				<Row>
					<Col>
						{this.renderTotalApplied(totalApplied)}
						{this.renderTotalRescued(totalRescued)}
						{this.renderTotalCosts(totalCosts)}
					</Col>
					<Col>
						{this.renderGrossBalance(asset.grossBalance)}
						{this.renderResult(result)}
						{this.renderPercentageResult(percentageResult)}
					</Col>
				</Row>
			</Container>
		);
	}
}

export default FixIncomeOperations;
