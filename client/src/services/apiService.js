import axios from 'axios';
import { API_URL } from '../constants';

// Axios instance
const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
	validateStatus: () => true, // Non logga nessuno status come errore di rete
});

// Centralized response interceptor for unwrapping and error handling
apiClient.interceptors.response.use(
	(response) => {
		const data = response.data;
		if (data && typeof data === 'object') {
			if (data.success === true) {
				return data.data;
			} else if (data.success === false && data.error) {
				const err = new Error('API Error');
				err.key = data.error;
				err.i18nKey = `api_errors.${data.error}`;
				return Promise.reject(err);
			}
		}
		return Promise.reject(new Error('Unknown API response format'));
	},
	(error) => {
		if (error.response && error.response.data && error.response.data.error) {
			const err = new Error('API Error');
			err.key = error.response.data.error;
			err.i18nKey = `api_errors.${error.response.data.error}`;
			return Promise.reject(err);
		}
		// Network or unexpected error
		return Promise.reject(error);
	}
);

async function apiCall(endpoint, options = {}) {
	const { method = 'GET', data, params, headers } = options;
	// console.log(`[API] ${method} ${endpoint}`, data || params);
	return apiClient.request({
		url: endpoint,
		method,
		data,
		params,
		headers,
	});
	// console.log(`[API SUCCESS] ${method} ${endpoint}`, result);
}

// ==================== AUTH API ====================

export async function login(username, password) {
	return apiCall('/api/sessions', {
		method: 'POST',
		data: { username, password },
	});
}

export async function logout() {
	return apiCall('/api/sessions/current', {
		method: 'DELETE',
	});
}

export async function getCurrentUser() {
	return apiCall('/api/sessions/current');
}

// ==================== THEMES API ====================

export async function getThemes() {
	return apiCall('/api/themes');
}

export async function getThemeById(id) {
	return apiCall(`/api/themes/${id}`);
}

export async function getTemplatesByTheme(themeId) {
	return apiCall(`/api/themes/${themeId}/templates`);
}

export async function getTemplateById(id) {
	return apiCall(`/api/themes/templates/${id}`);
}

// ==================== IMAGES API ====================

export async function getImagesByTheme(themeId) {
	return apiCall(`/api/background-images/${themeId}`);
}

export async function getImageDetails(id) {
	return apiCall(`/api/background-images/details/${id}`);
}

// ==================== RECAPS API ====================

export async function getPublicRecaps() {
	return apiCall('/api/recaps/public');
}

export async function getUserRecaps() {
	return apiCall('/api/recaps/my');
}

export async function getRecapById(id) {
	return apiCall(`/api/recaps/${id}`);
}

export async function createRecap(recapData) {
	return apiCall('/api/recaps', {
		method: 'POST',
		data: recapData,
	});
}

export async function updateRecap(id, recapData) {
	return apiCall(`/api/recaps/${id}`, {
		method: 'PUT',
		data: recapData,
	});
}

export async function deleteRecap(id) {
	return apiCall(`/api/recaps/${id}`, {
		method: 'DELETE',
	});
}