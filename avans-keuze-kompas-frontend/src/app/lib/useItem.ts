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
    // ✅ Build a valid VKMInput object
    const payload: VKMInput = {
        id: Date.now(),               // or 0 if your backend assigns it
        name: item.name,
        shortdescription: item.description,
        content: "",
        studycredit: 0,
        location: "",
        contact_id: 0,
        level: "",
    };

    const editItem = async (id: string, item: { name: string; description: string }) => {
        const updated = await updateItem(id, item);
        setItems(prev => prev.map(i => (i._id === id ? updated : i)));
    };

    return { items, loading, addItem, editItem };
}
