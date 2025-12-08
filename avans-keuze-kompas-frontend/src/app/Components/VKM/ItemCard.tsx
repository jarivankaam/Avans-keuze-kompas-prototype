"use Client";
import { Item } from "../../lib/useItem";
type Props = {
  item: Item;
  index: number;
};

export const ItemCard = ({ item, index }: Props) => {
  let bgColor = index % 2 === 0 ? "#F8F8F8" : "#c6002a";
  const textColor = bgColor == "#c6002a" ? "white" : "black";
  return (
    <div
      className="rounded shadow overflow-hidden"
      style={{ width: "400px", height: "350px" }}
    >
      {/* Image section - top half */}
      <div style={{ height: "175px", overflow: "hidden" }}>
        <img
          src="/card.png"
          alt={item.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {/* Content section - bottom half */}
      <div
        className="p-4 rounded-b"
        style={{ backgroundColor: bgColor, height: "175px" }}
      >
        <h2 className="text-lg font-semibold" style={{color: textColor}}>{item.name}</h2>
        <p className="text-gray-600 truncate" style={{color: textColor}}>{item.description}</p>
      </div>
    </div>
  );
};
