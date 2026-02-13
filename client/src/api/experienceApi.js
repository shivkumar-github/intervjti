import axios from "axios";
import api from "./axios";

export const onApprove = (id, accessToken) => {
	return api.patch(`/api/experiences/${id}/status`, { status: 'approved'}, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
}

export const onReject = (id, accessToken, reason, remark) => {
	return api.patch(`/api/experiences/${id}/status`, { status: 'rejected', reason, remark }, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
}