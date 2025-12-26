import axios from 'axios';

const API_URL = 'http://localhost:3001';

// Create an Axios instance
const apiClient = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true, // Include cookies for session-based auth
});

// Add a response interceptor
apiClient.interceptors.response.use(
	(response) => response.data, // Automatically return the data from the response
	(error) => {
		if (error.response) {
			// Handle HTTP errors
			const errorMessage = error.response.data?.error || 'API call failed';
			console.error(`API call failed: ${errorMessage}`);
			return Promise.reject(new Error(errorMessage));
		}
		console.error('Network error:', error.message);
		return Promise.reject(error);
	}
);

// Generic function to handle API calls
async function apiCall(endpoint, options = {}) {
	const { method = 'GET', data, params, headers } = options;

	return apiClient.request({
		url: endpoint,
		method,
		data,
		params,
		headers,
	});
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