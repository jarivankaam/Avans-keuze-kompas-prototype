'use client';

import { useEffect, useState } from 'react';
import { getItems, createItem, updateItem } from './api';
import { VKMInput } from "@/app/types/VKM";  // ✅ adjust path if needed

export type Item = {
  _id: string;
  name: string;
  shortdescription: string;
  description: string;
  content: string;
  studycredit: number;
  location: string;
  contact_id: number;
  level: string;
  learningoutcomes: string;
};

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch items on mount
  useEffect(() => {
    getItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ✅ Add
  const addItem = async (item: { name: string; description: string }) => {
    const payload: VKMInput = {
      id: Date.now(),
      name: item.name,
      shortdescription: item.description,
      content: "",
      studycredit: 0,
      location: "",
      contact_id: 0,
      level: "",
    };

    const newItem = await createItem(payload);
    setItems(prev => [...prev, newItem]);
  };

const editItem = async (id: string, item: { name: string; description: string }) => {
    const existing = items.find(i => String(i._id) === String(id));
    if (!existing) return;

    const payload: VKMInput = {
        id: existing._id,
        name: item.name,
        shortdescription: item.description,
        content: existing.content,
        studycredit: existing.studycredit,
        location: existing.location,
        contact_id: existing.contact_id,
        level: existing.level,
    };

    const updated = await updateItem(id, payload);

    setItems(prev => prev.map(i =>
        String(i._id) === String(id) ? updated : i
    ));
};
  // ✅ ✅ Correct: return from the hook, not inside addItem
  return { items, loading, addItem, editItem };
}
