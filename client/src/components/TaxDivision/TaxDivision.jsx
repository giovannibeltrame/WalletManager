import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { Button, Container, Form, Col } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';

import { numberToReais, numberToPercentage } from '../utils';

class TaxDivision extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			operations: [],
			totalCosts: null,
			totalEmoluments: null,
			totalOperationValue: null,
			totalSettlementFee: null,
		};
	}

	handleChangeTotalEmoluments = (event, maskedvalue, floatvalue) => {
		this.setState({
			totalEmoluments: floatvalue,
			totalCosts: floatvalue + this.state.totalSettlementFee,
		});
	};

	handleChangeTotalOperationValue = (event, maskedvalue, floatvalue) => {
		this.setState({
			totalOperationValue: floatvalue,
		});
	};

	handleChangeTotalSettlementFee = (event, maskedvalue, floatvalue) => {
		this.setState({
			totalSettlementFee: floatvalue,
			totalCosts: floatvalue + this.state.totalEmoluments,
		});
	};

	addRow = () => {
		const operations = [
			...this.state.operations,
			{ id: this.state.operations.length + 1, asset: '', value: 0 },
		];
		this.setState({ operations });
	};

	calcPercentages = () => {
		const operations = this.state.operations.map((item) => {
			const percentage = Number(item.value) / this.state.totalOperationValue;
			const settlementFee = this.state.totalSettlementFee * percentage;
			const emoluments = this.state.totalEmoluments * percentage;
			const costs = settlementFee + emoluments;
			return { ...item, percentage, settlementFee, emoluments, costs };
		});
		this.setState({ operations });
	};

	render() {
		const columns = [
			{
				dataField: 'id',
				text: '#',
				footer: 'TOTAL',
			},
			{
				dataField: 'asset',
				text: 'Ativo',
				footer: '',
			},
			{
				dataField: 'value',
				text: 'Valor',
				footer: numberToReais(this.state.totalOperationValue),
			},
			{
				dataField: 'percentage',
				editable: false,
				text: '%',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToPercentage(row.percentage),
				footer: (columnData) =>
					numberToPercentage(columnData.reduce((acc, item) => acc + item, 0)),
			},
			{
				dataField: 'settlementFee',
				editable: false,
				text: 'Taxa de liq.',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToReais(row.settlementFee),
				footer: (columnData) =>
					numberToReais(columnData.reduce((acc, item) => acc + item, 0)),
			},
			{
				dataField: 'emoluments',
				editable: false,
				text: 'Emolumentos',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToReais(row.emoluments),
				footer: (columnData) =>
					numberToReais(columnData.reduce((acc, item) => acc + item, 0)),
			},
			{
				dataField: 'costs',
				editable: false,
				text: 'Custos totais',
				formatter: (cell, row, rowIndex, formatExtraData) =>
					numberToReais(row.costs),
				footer: (columnData) =>
					numberToReais(columnData.reduce((acc, item) => acc + item, 0)),
			},
		];

		return (
			<Container>
				<h2 className='mt-5'>Divisão de impostos</h2>
				<Form className='w-75 my-5'>
					<Form.Row>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Total Valor Operação'
								value={this.state.totalOperationValue}
								onChangeEvent={this.handleChangeTotalOperationValue}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Total Taxa de liq.'
								value={this.state.totalSettlementFee}
								onChangeEvent={this.handleChangeTotalSettlementFee}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
							/>
						</Col>
						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Total Emolumentos'
								value={this.state.totalEmoluments}
								onChangeEvent={this.handleChangeTotalEmoluments}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
							/>
						</Col>

						<Col>
							<CurrencyInput
								className='form-control'
								placeholder='Total Custos'
								value={this.state.totalCosts}
								decimalSeparator=','
								thousandSeparator='.'
								prefix='R$ '
								disabled
							/>
						</Col>
					</Form.Row>
				</Form>
				<BootstrapTable
					hover
					keyField='id'
					data={this.state.operations}
					columns={columns}
					cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
				/>
				<Button variant='primary' onClick={this.addRow}>
					+ Adicionar
				</Button>{' '}
				<Button variant='secondary' onClick={this.calcPercentages}>
					Calcular %
				</Button>
			</Container>
		);
	}
}

export default TaxDivision;
