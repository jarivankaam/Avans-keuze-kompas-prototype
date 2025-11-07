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

  // ✅ Edit
  const editItem = async (id: string, item: { name: string; description: string }) => {
    const updated = await updateItem(id, item);
    setItems(prev => prev.map(i => (i.id === id ? updated : i)));
  };

  // ✅ ✅ Correct: return from the hook, not inside addItem
  return { items, loading, addItem, editItem };
}
