import { apiClient } from "../utils/apiClient";

export interface FeedbackItem {
  id?: string;
  _id?: string;
  title: string;
  package_name?: string;
  description?: string;
  type?: "rating" | "free_text" | "rating_text";
  status?: "active" | "inactive";
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}


export interface FeedbackEntry {
  _id: string;
  form_id: string;
  message?: string;
  rating?: number;
  created_at: string;
  app_version?: string;
  user_id?: string;
  device_info?: {
    os?: string;
    model?: string;
    manufacturer?: string;
    version?: string;
  };
}

export interface SearchParams {
  package_name?: string;
  status?: string;
  title?: string;
  type?: string;
}

export interface CreateFormParams {
  package_name: string;
  title: string;
  type: "rating" | "free_text" | "rating_text";
}

export interface FeedbackStatistics {
  average_rating: number;
  rating_breakdown: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
  total_feedback: number;
}

export class FeedbackService {
  async getAllPackages(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>("/forms/packages");
      return response || [];
    } catch (error) {
      console.error("Error fetching packages:", error);
      return [];
    }
  }

  async searchFeedback(params: SearchParams = {}): Promise<FeedbackItem[]> {
    try {
      // Convert the is_active parameter
      const queryParams: Record<string, any> = { ...params };

      if (queryParams.is_active === true) {
        queryParams.is_active = "true";
      } else if (queryParams.is_active === false) {
        queryParams.is_active = "false";
      }

      const response = await apiClient.get<FeedbackItem[]>(
        "/forms/search",
        queryParams
      );
      return response || [];
    } catch (error) {
      console.error("Error searching feedback:", error);
      return [];
    }
  }

  async createForm(formData: CreateFormParams): Promise<FeedbackItem> {
    try {
      const response = await apiClient.post<FeedbackItem>(
        "/admin/forms",
        formData
      );
      return response;
    } catch (error) {
      console.error("Error creating form:", error);
      throw error;
    }
  }

  // Fetch feedback entries for a specific form
  async getFeedbackEntries(
    packageName: string,
    formId: string
  ): Promise<FeedbackEntry[]> {
    try {
      const url = `/feedback/${packageName}`;
      const response = await apiClient.get<FeedbackEntry[]>(url, {
        form_id: formId,
      });
      return response || [];
    } catch (error) {
      console.error(
        `Error fetching feedback entries for form ${formId}:`,
        error
      );
      return [];
    }
  }

  async getFeedbackStatistics(
    packageName: string,
    formId: string
  ): Promise<FeedbackStatistics> {
    try {
      const url = `/feedback/stats/${packageName}`;
      const response = await apiClient.get<FeedbackStatistics>(url, {
        form_id: formId,
      });
      return (
        response || {
          average_rating: 0,
          rating_breakdown: {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
          },
          total_feedback: 0,
        }
      );
    } catch (error) {
      console.error(
        `Error fetching feedback statistics for form ${formId}:`,
        error
      );
      return {
        average_rating: 0,
        rating_breakdown: {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
        },
        total_feedback: 0,
      };
    }
  }
  async updateFormStatus(
    formId: string,
    isActive: boolean
  ): Promise<FeedbackItem> {
    try {
      const response = await apiClient.put<FeedbackItem>(
        `/forms/${formId}/activate`,
        {
          is_active: isActive,
        }
      );
      return response;
    } catch (error) {
      console.error(`Error updating form status for ID ${formId}:`, error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
