import { io } from "socket.io-client";

export const createSocket = (token) => {
	return io(import.meta.env.VITE_API_URL, {
		withCredentials: true,
		auth: {
			token
		}
	});
}