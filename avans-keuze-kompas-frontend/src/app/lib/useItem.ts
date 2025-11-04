// lib/useItems.ts
'use client';

import { useEffect, useState } from 'react';
import { getItems, createItem, updateItem } from './api';
export type Item = {
    "id" : string,
    "name" : string,
    "shortdescription": string,
    "description": string,
    "content": string,
    "studycredit": number,
    "location": string,
    "contact_id": number,
    "level": string,
    "learningoutcomes": string
};

export function useItems() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getItems()
            .then(setItems)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const addItem = async (item: { name: string; description: string }) => {
        const newItem = await createItem(item);
        setItems(prev => [...prev, newItem]);
    };

    const editItem = async (id: string, item: { name: string; description: string }) => {
        const updated = await updateItem(id, item);
        setItems(prev => prev.map(i => (i._id === id ? updated : i)));
    };

    return { items, loading, addItem, editItem };
}
