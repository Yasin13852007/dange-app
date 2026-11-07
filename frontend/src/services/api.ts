/**
 * API client and TypeScript definitions matching the FastAPI backend schema.
 */

const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Data structure representing a subscription received from the API.
 */
export interface Subscription {
  id: number;
  title: string;
  price: number;
  billing_cycle: string;
  next_payment_date: string;
  category?: string | null;
  is_active?: boolean;
  created_at?: string;
}

/**
 * Payload required to create a new subscription.
 */
export interface SubscriptionCreate {
  title: string;
  price: number;
  billing_cycle: string;
  next_payment_date: string;
  category?: string;
  is_active?: boolean;
}

/**
 * Fetches all active subscriptions from the backend.
 */
export async function getSubscriptions(): Promise<Subscription[]> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Creates a new subscription entry in the backend database.
 */
export async function createSubscription(
  data: SubscriptionCreate
): Promise<Subscription> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create subscription: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Deletes a subscription by its unique identifier.
 */
export async function deleteSubscription(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete subscription: ${response.statusText}`);
  }
}
