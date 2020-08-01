import server from '../../apis/server';

export const onDeleteAssets = async (_id) => {
	await server.delete('/assets/' + _id);
};

export const onGetAssets = async () => {
	const response = await server.get('/assets?$orderby=description');
	return response.data;
};

export const onGetAsset = async (description) => {
	const response = await server.get(
		'/assets?$filter=description $eq ' + description
	);
	return response.data[0];
};

export const onPostAssets = async (asset) => {
	const response = await server.post('/assets', { ...asset });
	return response.data;
};

export const onPutAssets = async (asset) => {
	const response = await server.put('/assets/' + asset._id, {
		$set: { ...asset },
	});
	return response.data;
};
