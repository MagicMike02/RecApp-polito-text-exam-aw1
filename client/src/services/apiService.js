import axios from 'axios';
import { API_URL } from '../constants';

// Axios instance
const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true, 
});

//response interceptor
apiClient.interceptors.response.use(
	(response) => response.data, 
	(error) => {
		if (error.response) {
			const errorData = error.response.data;
			const errorMessage = errorData?.message || errorData?.error || 'API call failed';
			const errorDetails = errorData?.errors ? JSON.stringify(errorData.errors, null, 2) : null;

			console.error(`[API ERROR ${error.response.status}]`, {
				message: errorMessage,
				details: errorDetails,
				fullResponse: errorData,
			});

			const fullError = errorDetails ? `${errorMessage}\n\nDettagli:\n${errorDetails}` : errorMessage;
			return Promise.reject(new Error(fullError));
		}
		console.error('Network error:', error.message);
		return Promise.reject(error);
	}
);

async function apiCall(endpoint, options = {}) {
	const { method = 'GET', data, params, headers } = options;

	try {
		console.log(`[API] ${method} ${endpoint}`, data || params); 
		const result = await apiClient.request({
			url: endpoint,
			method,
			data,
			params,
			headers,
		});
		console.log(`[API SUCCESS] ${method} ${endpoint}`, result);
		return result;
	} catch (error) {
		console.error(`[API EXCEPTION] ${method} ${endpoint}:`, error.message);
		throw error;
	}
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