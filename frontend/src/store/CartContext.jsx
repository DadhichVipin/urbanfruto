import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const KEY = "uf_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (item, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.item_id === item.item_id && p.meta === (item.meta || ""));
      if (i > -1) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...item, meta: item.meta || "", qty }];
    });
  };

  const setQty = (item_id, meta, qty) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => !(p.item_id === item_id && p.meta === meta))
        : prev.map((p) => (p.item_id === item_id && p.meta === meta ? { ...p, qty } : p))
    );

  const remove = (item_id, meta) =>
    setItems((prev) => prev.filter((p) => !(p.item_id === item_id && p.meta === meta)));

  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, add, setQty, remove, clear, total, count, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
