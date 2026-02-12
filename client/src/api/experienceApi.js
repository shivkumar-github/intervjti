import axios from "axios";
export const onApprove = (id, accessToken) => {
	return axios.patch(`http://localhost:1000/api/experiences/${id}/status`, { status: 'approved' }, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
}

export const onReject = (id, accessToken) => {
	return axios.patch(`http://localhost:1000/api/experiences/${id}/status`, { status: 'rejected' }, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
}