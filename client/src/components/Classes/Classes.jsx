import React from 'react';
import {
	Form,
	FormControl,
	Button,
	Alert,
	Table,
	Container,
	Row,
	Col,
} from 'react-bootstrap';
import { ResponsivePie } from '@nivo/pie';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import CurrencyInput from 'react-currency-input';

import {
	onDeleteClasses,
	onGetClasses,
	onPostClasses,
} from './ClassesController';

import {
	ADD_CLASS_SUCCESS,
	ADD_CLASS_ERROR,
	DELETE_CLASS_SUCCESS,
	DELETE_CLASS_ERROR,
} from '../constants';
import { numberToReais, numberToPercentage, numberToDecimal } from '../utils';

class Classes extends React.Component {
	state = {
		classes: [],
		simulateData: [],
		description: '',
		percentage: null,
		message: '',
		variantMessage: '',
	};

	async componentDidMount() {
		this.setState({ classes: await onGetClasses() });
	}

	handleChangeDescription = (event) => {
		this.setState({ description: event.target.value });
	};

	handleChangePercentage = (event, maskedvalue, floatvalue) => {
		this.setState({
			percentage: floatvalue,
		});
	};

	handleSubmit = async (event) => {
		event.preventDefault();
		try {
			await onPostClasses(
				this.state.description,
				Number(this.state.percentage)
			);
			this.setState({
				message: ADD_CLASS_SUCCESS,
				variantMessage: 'success',
				classes: await onGetClasses(),
			});
		} catch {
			this.setState({
				message: ADD_CLASS_ERROR,
				variantMessage: 'danger',
			});
		}
	};

	handleDelete = async (_id) => {
		try {
			await onDeleteClasses(_id);
			this.setState({
				message: DELETE_CLASS_SUCCESS,
				variantMessage: 'warning',
				classes: await onGetClasses(),
			});
		} catch {
			this.setState({
				message: DELETE_CLASS_ERROR,
				variantMessage: 'danger',
			});
		}
	};

	mapClassesToData = () => {
		const response = this.state.classes.map((item) => ({
			id: item._id,
			value: item.percentage,
			label: item.description,
		}));
		return response;
	};

	renderMessage = () => {
		return this.state.message ? (
			<Alert className='w-50' variant={this.state.variantMessage}>
				{this.state.message}
			</Alert>
		) : null;
	};

	renderTableBody = () => {
		if (this.state.classes.length === 0) {
			return (
				<tr>
					<td align='center'>Sem resultados</td>
				</tr>
			);
		}
		return this.state.classes.map((item) => {
			return (
				<tr key={item._id}>
					<td>{item.description}</td>
					<td>{numberToDecimal(item.percentage)}%</td>
					<td>
						<Button
							variant='outline-danger'
							size='sm'
							onClick={() => this.handleDelete(item._id)}
						>
							Excluir
						</Button>
					</td>
				</tr>
			);
		});
	};

	renderTableFooter = () => {
		const percentageSum = this.state.classes.reduce(
			(accumulator, currentValue) => accumulator + currentValue.percentage,
			0
		);
		if (percentageSum === 0) return null;
		return (
			<tr>
				<td>
					<b>Total</b>
				</td>
				<td>
					<b>{numberToDecimal(percentageSum)}%</b>
				</td>
				<td />
			</tr>
		);
	};

	simulate = () => {
		if (this.state.simulateData.length === 0) {
			const { state: classesGrossBalanceData } = this.props.location;
			this.setState({
				simulateData: JSON.parse(JSON.stringify(classesGrossBalanceData)),
			});
			return;
		}

		const totalGrossBalance = this.state.simulateData.reduce(
			(acc, asset) => acc + Number(asset.assetClassGrossBalance),
			0
		);

		const simulateData = this.state.simulateData.map((item) => {
			item.assetClassGrossBalance = Number(item.assetClassGrossBalance);
			item.value = item.assetClassGrossBalance / totalGrossBalance;
			return item;
		});

		this.setState({ simulateData });
	};

	render() {
		const { state: classesGrossBalanceData } = this.props.location;

		const percentageColumns = [
			{
				dataField: 'label',
				text: 'Classe de ativo',
				footer: 'TOTAL',
				sort: true,
				editable: false,
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
				editable: false,
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
				sort: true,
				editorRenderer: (editorProps, value, row, rowIndex, columnIndex) => (
					<CurrencyInput
						className='form-control'
						value={row.assetClassGrossBalance}
						onChangeEvent={(event, maskedvalue, floatvalue) => {
							row.assetClassGrossBalance = floatvalue;
						}}
						decimalSeparator=','
						thousandSeparator='.'
						prefix='R$ '
					/>
				),
			},
		];

		return (
			<Container>
				<h2 className='my-5'>Carteira planejada</h2>
				{this.renderMessage()}
				<Form inline onSubmit={this.handleSubmit}>
					<FormControl
						onChange={this.handleChangeDescription}
						type='text'
						placeholder='Classe de ativo'
						className='mr-sm-2'
					/>
					<CurrencyInput
						className='form-control mr-sm-2'
						placeholder='% Planejada'
						value={this.state.percentage}
						onChangeEvent={this.handleChangePercentage}
						decimalSeparator=','
						thousandSeparator='.'
						suffix='%'
					/>
					<Button variant='outline-primary' type='submit'>
						Incluir
					</Button>
				</Form>

				<Row>
					<Col>
						<Table responsive hover className='mt-4'>
							<tbody>
								{this.renderTableBody()}
								{this.renderTableFooter()}
							</tbody>
						</Table>
					</Col>
					<Col>
						<BootstrapTable
							hover
							keyField='id'
							data={classesGrossBalanceData}
							columns={percentageColumns}
							defaultSorted={[{ dataField: 'label', order: 'asc' }]}
						/>
					</Col>
				</Row>

				<Row style={{ height: 400 }}>
					<Col>
						<ResponsivePie
							colors={{ scheme: 'paired' }}
							margin={{ top: 30, right: 120, bottom: 30, left: 120 }}
							data={this.mapClassesToData()}
							innerRadius={0.3}
							padAngle={1}
							radialLabel={'label'}
							radialLabelsLinkStrokeWidth={1}
							enableSlicesLabels={false}
							tooltipFormat={(value) => value + '%'}
						/>
					</Col>
					<Col>
						<ResponsivePie
							colors={{ scheme: 'paired' }}
							margin={{ top: 30, right: 120, bottom: 30, left: 120 }}
							data={classesGrossBalanceData}
							innerRadius={0.3}
							padAngle={1}
							radialLabel={'label'}
							radialLabelsLinkStrokeWidth={1}
							enableSlicesLabels={false}
							tooltipFormat={(value) => numberToPercentage(value)}
						/>
					</Col>
				</Row>

				<Row style={{ height: 400 }}>
					<Col>
						<BootstrapTable
							hover
							keyField='id'
							data={this.state.simulateData}
							columns={percentageColumns}
							defaultSorted={[{ dataField: 'label', order: 'asc' }]}
							cellEdit={cellEditFactory({ mode: 'click', blurToSave: true })}
						/>
						<Button variant='outline-primary' onClick={() => this.simulate()}>
							Simular
						</Button>
					</Col>
					<Col>
						<ResponsivePie
							colors={{ scheme: 'paired' }}
							margin={{ top: 30, right: 120, bottom: 30, left: 120 }}
							data={this.state.simulateData}
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

export default Classes;
