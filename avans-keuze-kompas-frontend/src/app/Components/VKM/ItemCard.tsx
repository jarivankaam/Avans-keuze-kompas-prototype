'use Client';
import {Item} from '../../lib/useItem';
type Props = {
    item: Item,
}

export const ItemCard = ({ item }: Props)=>{
    return (
        <div className="p-4 rounded shadow bg-gray-50">
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p className="text-gray-600 truncate">{item.description}</p>
        </div>
    )
}