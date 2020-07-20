import React from 'react';

import { Container, Nav, Navbar } from 'react-bootstrap';
import { Router, Route, NavLink } from 'react-router-dom';

import Classes from './Classes';
import Assets from './Assets';
import Operations from './Operations/Operations';
import TaxDivision from './TaxDivision';
import Balance from './Balance';
import history from './history';

const App = () => {
	return (
		<Router history={history}>
			<Container>
				<Navbar>
					<Navbar.Brand as={NavLink} to='/'>
						WalletManager
					</Navbar.Brand>
					<Nav>
						<Nav.Link as={NavLink} to='/classes'>
							Classes
						</Nav.Link>
						<Nav.Link as={NavLink} to='/assets'>
							Assets
						</Nav.Link>
						<Nav.Link as={NavLink} to='/balance'>
							Balance
						</Nav.Link>
						<Nav.Link as={NavLink} to='/taxdivision'>
							Tax Division
						</Nav.Link>
					</Nav>
				</Navbar>
				<Route path='/classes' exact component={Classes} />
				<Route path='/assets' exact component={Assets} />
				<Route path='/operations' exact component={Operations} />
				<Route path='/taxdivision' exact component={TaxDivision} />
				<Route path='/balance' exact component={Balance} />
			</Container>
		</Router>
	);
};

export default App;
