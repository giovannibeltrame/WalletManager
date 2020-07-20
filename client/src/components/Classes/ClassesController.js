import server from '../../apis/server';

export const onDeleteClasses = async (_id) => {
	await server.delete('/classes/' + _id);
};

export const onGetClasses = async () => {
	const response = await server.get('/classes?$orderby=description');
	return response.data;
};

export const onPostClasses = async (description, percentage) => {
	const response = await server.post('/classes', {
		description,
		percentage,
	});
	return response.data;
};
