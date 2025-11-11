'use client';

import { useEffect, useState } from 'react';
import { getItems, createItem, updateItem } from './api';
import type { VKM } from "@/app/types/VKM";
import VKMFactory from './factories/VKMFactory';

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

  // Fetch items on mount
  useEffect(() => {
    getItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Add new item using VKMFactory
  const addItem = async (item: { name: string; description: string }) => {
    // Use VKMFactory to create a new VKM input object with validation
    const payload = VKMFactory.createNew(item.name, item.description);

    // Validate before sending
    const validationErrors = VKMFactory.validate(payload);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const newItem = await createItem(payload);
    setItems(prev => [...prev, newItem]);
  };

  // Edit existing item using VKMFactory
  const editItem = async (id: string, item: { name: string; description: string }) => {
    const existing = items.find(i => String(i._id) === String(id));
    if (!existing) return;

    // Use VKMFactory to create updated VKM input from existing item
    const payload = VKMFactory.createFromExisting(existing as unknown as VKM, {
      name: item.name,
      shortdescription: item.description,
    });

    // Validate before sending
    const validationErrors = VKMFactory.validate(payload);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const updated = await updateItem(id, payload);

    setItems(prev => prev.map(i =>
      String(i._id) === String(id) ? updated : i
    ));
  };

  return { items, loading, addItem, editItem };
}
