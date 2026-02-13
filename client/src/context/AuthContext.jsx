import { createContext, useState, useContext } from "react";
import axios from 'axios'
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [accessToken, setAccessToken] = useState(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [role, setRole] = useState(null);
	const refreshAccessToken = async() => {
		try {
			const response = await api.post(
				'/api/auth/refresh',
				{},
				{withCredentials:true}
			);
			setAccessToken(response.data.accessToken);
			const decoded = jwtDecode(response.data.accessToken);
			setRole(decoded.role);
			setIsLoggedIn(true);
		} catch (err){
			setAccessToken(null);
			setIsLoggedIn(false);
		}
	};
	const value = {
		isLoggedIn,
		setIsLoggedIn,
		accessToken,
		setAccessToken,
		role,
		setRole,
		refreshAccessToken
	};

	useEffect(() => {
		const callRefreshAccessToken = async () => {
			await refreshAccessToken();
		};
		callRefreshAccessToken();

	}, []);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};

export const useAuth = () => useContext(AuthContext);
