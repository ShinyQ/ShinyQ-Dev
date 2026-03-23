import type { FoodLogResponse, DailySummary, UserProfile, RecentFood } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ error: "unknown", detail: "Request failed" }));
      throw new ApiError(
        error.detail || "Request failed",
        res.status,
        error.error,
        error.retry_after
      );
    }
    return res.json();
  }

  // Foods
  async logFood(data: {
    description?: string;
    image_base64?: string;
    meal_type?: string;
    logged_at?: string;
  }): Promise<FoodLogResponse> {
    return this.request<FoodLogResponse>("/api/foods/log", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getRecentFoods(limit = 20): Promise<RecentFood[]> {
    return this.request<RecentFood[]>(`/api/foods/recent?limit=${limit}`);
  }

  async deleteFoodEntry(entryId: string): Promise<{ status: string; id: string }> {
    return this.request<{ status: string; id: string }>(
      `/api/foods/entry/${entryId}`,
      { method: "DELETE" }
    );
  }

  // Summary
  async getDailySummary(date?: string): Promise<DailySummary> {
    const params = date ? `?date=${date}` : "";
    return this.request<DailySummary>(`/api/summary/daily${params}`);
  }

  async getDateRangeSummaries(
    start: string,
    end: string
  ): Promise<Record<string, DailySummary>> {
    return this.request<Record<string, DailySummary>>(
      `/api/summary/range?start=${start}&end=${end}`
    );
  }

  // Users
  async getMe(): Promise<UserProfile> {
    return this.request<UserProfile>("/api/users/me");
  }

  async updateProfile(
    data: Partial<
      Pick<
        UserProfile,
        "weight_kg" | "height_cm" | "age" | "gender" | "activity_level" | "goal"
      >
    >
  ): Promise<UserProfile> {
    return this.request<UserProfile>("/api/users/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
