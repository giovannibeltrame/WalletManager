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

import {
	onDeleteClasses,
	onGetClasses,
	onPostClasses,
} from './ClassesController';

class Classes extends React.Component {
	state = {
		classes: [],
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

	handleChangePercentage = (event) => {
		this.setState({ percentage: event.target.value });
	};

	handleSubmit = async (event) => {
		event.preventDefault();
		try {
			await onPostClasses(
				this.state.description,
				Number(this.state.percentage)
			);
			this.setState({
				message: 'Classe de ativo incluída com sucesso!',
				variantMessage: 'success',
				classes: await onGetClasses(),
			});
		} catch {
			this.setState({
				message: 'Erro ao tentar incluir classe de ativo',
				variantMessage: 'danger',
			});
		}
	};

	handleDelete = async (_id) => {
		try {
			await onDeleteClasses(_id);
			this.setState({
				message: 'Classe de ativo excluída com sucesso!',
				variantMessage: 'warning',
				classes: await onGetClasses(),
			});
		} catch {
			this.setState({
				message: 'Erro ao tentar excluir classe de ativo',
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
					<td>{item.percentage}%</td>
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
					<b>{percentageSum}%</b>
				</td>
				<td />
			</tr>
		);
	};

	render() {
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
					<FormControl
						onChange={this.handleChangePercentage}
						type='number'
						placeholder='% Planejada'
						className='mr-sm-2'
					/>
					<Button variant='outline-primary' type='submit'>
						Incluir
					</Button>
				</Form>

				<Row style={{ height: 500 }}>
					<Col>
						<Table responsive hover className='mt-4'>
							<tbody>
								{this.renderTableBody()}
								{this.renderTableFooter()}
							</tbody>
						</Table>
					</Col>
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
							tooltipFormat={(value) => value + '%'}
						/>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Classes;
