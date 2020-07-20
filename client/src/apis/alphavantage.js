import axios from 'axios';

const apiKey = '42IKHTLZ9BJG42V2';

export default axios.create({
	baseURL: 'https://www.alphavantage.co/query?apikey=' + apiKey,
});
