'use Client';
import {Item} from '../../lib/useItem';
type Props = {
    item: Item,
    index: number,
}

export const ItemCard = ({ item, index }: Props)=>{
    const bgColor = index % 2 === 0 ? '#F8F8F8' : '#FF8B8B';

    return (
        <div className="p-4 rounded shadow" style={{ backgroundColor: bgColor, width: '400px', height: '350px' }}>
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p className="text-gray-600 truncate">{item.description}</p>
        </div>
    )
}