import React from 'react';
import { Container, Table, Button, Form, Col, Alert } from 'react-bootstrap';

import { onGetAssets, onPostAssets, onDeleteAssets } from './AssetsController';
import { onGetClasses } from '../Classes/ClassesController';
import history from '../history';

import {
	ADD_ASSET_SUCCESS,
	ADD_ASSET_ERROR,
	DELETE_ASSET_SUCCESS,
	DELETE_ASSET_ERROR,
	BROKER_AVENUE,
	BROKER_BANCO_INTER,
	BROKER_BINANCE,
	BROKER_BISCOINT,
	BROKER_BTG,
	BROKER_CLEAR,
	BROKER_ORAMA,
	BROKER_RICO,
	BROKER_SANTANDER,
	BROKER_SOFISA,
	BRL,
	USD,
} from '../constants';

class Assets extends React.Component {
	state = {
		assets: [],
		classes: [],
		assetClass: '',
		broker: '',
		currency: '',
		description: '',
		ticker: '',
		message: '',
		variantMessage: '',
	};

	async componentDidMount() {
		this.setState({
			assets: await onGetAssets(),
			classes: await onGetClasses(),
		});
	}

	handleChangeDescription = (event) => {
		this.setState({ description: event.target.value });
	};

	handleChangeTicker = (event) => {
		this.setState({ ticker: event.target.value });
	};

	handleChangeAssetClass = (event) => {
		this.setState({
			assetClass: event.target.value,
		});
	};

	handleChangeBroker = (event) => {
		this.setState({
			broker: event.target.value,
		});
	};

	handleChangeCurrency = (event) => {
		this.setState({
			currency: event.target.value,
		});
	};

	handleSubmit = async (event) => {
		const { assetClass, broker, currency, description, ticker } = this.state;
		event.preventDefault();
		try {
			await onPostAssets({
				assetClass,
				broker,
				currency,
				description,
				ticker,
				grossBalance: 0,
			});
			this.setState({
				message: ADD_ASSET_SUCCESS,
				variantMessage: 'success',
				assets: await onGetAssets(),
			});
		} catch {
			this.setState({
				message: ADD_ASSET_ERROR,
				variantMessage: 'danger',
			});
		}
	};

	handleDelete = async (_id) => {
		try {
			await onDeleteAssets(_id);
			this.setState({
				message: DELETE_ASSET_SUCCESS,
				variantMessage: 'warning',
				assets: await onGetAssets(),
			});
		} catch {
			this.setState({
				message: DELETE_ASSET_ERROR,
				variantMessage: 'danger',
			});
		}
	};

	handleAssetClick = (asset) => {
		history.push('/operations', asset);
	};

	renderTableBody = () => {
		if (this.state.assets.length === 0) {
			return (
				<tr>
					<td align='center' colSpan='6'>
						Sem resultados
					</td>
				</tr>
			);
		}
		return this.state.assets.map((item) => {
			return (
				<tr key={item._id} onClick={() => this.handleAssetClick(item)}>
					<td>{item.description}</td>
					<td>{item.ticker}</td>
					<td>{item.assetClass}</td>
					<td>{item.currency}</td>
					<td>{item.broker}</td>
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

	renderMessage = () => {
		return this.state.message ? (
			<Alert className='w-50' variant={this.state.variantMessage}>
				{this.state.message}
			</Alert>
		) : null;
	};

	render() {
		return (
			<Container>
				<h2 className='my-5'>Ativos</h2>
				{this.renderMessage()}
				<Form onSubmit={this.handleSubmit} className='w-50'>
					<Form.Row>
						<Col>
							<Form.Control
								placeholder='Descrição'
								onChange={this.handleChangeDescription}
								type='text'
							/>
						</Col>
						<Col>
							<Form.Control
								placeholder='Ticker'
								onChange={this.handleChangeTicker}
								type='text'
							/>
						</Col>
					</Form.Row>

					<Form.Row className='mt-3'>
						<Col>
							<Form.Label>Classe de ativo</Form.Label>
							<Form.Control
								as='select'
								custom
								onChange={this.handleChangeAssetClass}
							>
								<option />
								{this.state.classes.map((item) => (
									<option key={item._id}>{item.description}</option>
								))}
							</Form.Control>
						</Col>
						<Col>
							<Form.Label>Moeda ($)</Form.Label>
							<Form.Control
								as='select'
								custom
								onChange={this.handleChangeCurrency}
							>
								<option />
								<option>{BRL}</option>
								<option>{USD}</option>
							</Form.Control>
						</Col>
						<Col>
							<Form.Label>Corretora</Form.Label>
							<Form.Control
								as='select'
								custom
								onChange={this.handleChangeBroker}
							>
								<option />
								<option>{BROKER_AVENUE}</option>
								<option>{BROKER_BANCO_INTER}</option>
								<option>{BROKER_BINANCE}</option>
								<option>{BROKER_BISCOINT}</option>
								<option>{BROKER_BTG}</option>
								<option>{BROKER_CLEAR}</option>
								<option>{BROKER_ORAMA}</option>
								<option>{BROKER_RICO}</option>
								<option>{BROKER_SANTANDER}</option>
								<option>{BROKER_SOFISA}</option>
							</Form.Control>
						</Col>
					</Form.Row>
					<Button variant='outline-primary' type='submit' className='mt-3'>
						Incluir
					</Button>
				</Form>
				<Table responsive bordered hover className='mt-4'>
					<tbody>
						<tr>
							<th>Descrição</th>
							<th>Ticker</th>
							<th>Classe de ativo</th>
							<th>Moeda</th>
							<th>Corretora</th>
							<th />
						</tr>
						{this.renderTableBody()}
					</tbody>
				</Table>
			</Container>
		);
	}
}

export default Assets;
