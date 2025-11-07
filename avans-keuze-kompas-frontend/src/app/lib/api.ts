import { getToken } from "./auth/authClient";
import { VKMInput } from "@/app/types/VKM";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getItems() {
  const res = await fetch(`${API_BASE}/vkm`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch VKMs");
  return res.json();
}

export async function getItem(id: string) {
  const res = await fetch(`${API_BASE}/vkm/${id}`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch VKM with id ${id}`);
  return res.json();
}



export async function createItem(item: VKMInput) {
  const res = await fetch(`${API_BASE}/vkm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(item),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Create VKM failed:", error);
    throw new Error("Failed to create item");
  }

  return res.json();
}

export async function updateItem(id: number, data: VKMInput) {
  const res = await fetch(`${API_BASE}/vkm/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Update VKM failed:", err);
    throw new Error("Failed to update VKM");
  }

  return res.json();
}

export async function deleteItem(id: string) {
  const res = await fetch(`${API_BASE}/vkm/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete VKM");
  return res.json();
}
