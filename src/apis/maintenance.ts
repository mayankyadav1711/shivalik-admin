import apiClient from './apiService';

// Get all maintenance bills (admin view)
export const getMaintenanceBills = async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/maintenance/bills?${queryString}`);
    return response.data;
};
