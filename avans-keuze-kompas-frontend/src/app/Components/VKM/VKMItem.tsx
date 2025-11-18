// components/ItemsView.tsx
'use client';

import { useItems } from '../../lib/useItem';
import {ItemCard} from './ItemCard';

export default function ItemsView() {
    const { items, loading } = useItems();

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container">
            <h2 className="text-3xl mb-2 font-bold">Alle keuze modules:</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-3 gap-4">

                {items.map((item, index) => (
                    <ItemCard key={item._id} item={item} index={index} />
                ))}
            </div>
        </div>
    );
}
