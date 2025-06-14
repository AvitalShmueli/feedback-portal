import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base configuration for API requests
// Custom API client class
class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: 'https://feedback-backend-one.vercel.app',
      headers: {
        'Content-Type': 'application/json',
        // Adding these headers can help with some CORS issues
        'Accept': 'application/json'
      },
      // Setting withCredentials to true if your API requires cookies/auth
      // withCredentials: true,
      timeout: 10000, // 10 seconds timeout
    });
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle specific error cases
        if (error.response) {
          console.error('API Error:', error.response.status, error.response.data);
          
          // Specific handling for CORS errors
          if (error.response.status === 0 || 
             (error.response.status === 403 && error.response.statusText === 'Forbidden')) {
            console.error('Possible CORS issue detected');
          }
        } else if (error.request) {
          console.error('Network error, please check your connection');
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // API methods
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      // For CORS issues, sometimes using a proxy can help
      // You might need to set up a proxy in your vite.config.ts
      const response: AxiosResponse<T> = await this.client.get(url, { 
        params,
        // Add cache control to prevent caching issues
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error in GET ${url}:`, error);
      throw error;
    }
  }
  
  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error in POST ${url}:`, error);
      throw error;
    }
  }
  
  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      console.error(`Error in PUT ${url}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();