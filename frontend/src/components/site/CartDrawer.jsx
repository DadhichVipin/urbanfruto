import { Link } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/CartContext";
import { inr } from "@/lib/api";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total } = useCart();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" data-testid="cart-drawer">
      <div className="absolute inset-0 bg-[#0f3d23]/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="relative flex h-full w-full max-w-[420px] flex-col bg-[#f3fbee] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#d8e8d0] px-5 py-4">
          <h3 className="uf-display text-lg font-bold">Your Fruit Bucket</h3>
          <button data-testid="cart-close-btn" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[#cfe3c6] bg-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div data-testid="cart-empty" className="mt-20 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-[#a8c99c]" />
              <p className="mt-4 text-sm text-[#55785f]">Your bucket is empty.</p>
              <Link to="/baskets" onClick={() => setOpen(false)} className="uf-btn-dark mt-5">
                Browse Hampers
              </Link>
            </div>
          ) : (
            <ul className="grid gap-3">
              {items.map((i) => (
                <li key={`${i.item_id}-${i.meta}`} data-testid={`cart-item-${i.item_id}`} className="uf-card flex gap-3 p-3">
                  {i.image && <img src={i.image} alt={i.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-[#6d8a63]">{i.meta || i.kind}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-2 rounded-full border border-[#cfe3c6] bg-white px-2 py-1">
                        <button data-testid={`cart-dec-${i.item_id}`} onClick={() => setQty(i.item_id, i.meta, i.qty - 1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-4 text-center text-xs font-bold">{i.qty}</span>
                        <button data-testid={`cart-inc-${i.item_id}`} onClick={() => setQty(i.item_id, i.meta, i.qty + 1)}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#e4601f]">{inr(i.price * i.qty)}</span>
                      <button data-testid={`cart-remove-${i.item_id}`} onClick={() => remove(i.item_id, i.meta)} className="ml-auto text-[#99785f]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#d8e8d0] bg-white px-5 py-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#55785f]">Bucket Total</span>
              <span data-testid="cart-total" className="uf-display text-2xl font-bold text-[#e4601f]">{inr(total)}</span>
            </div>
            <p className="mt-1 text-xs text-[#6d8a63]">Free express delivery • Complimentary wicker packing</p>
            <Link to="/checkout" onClick={() => setOpen(false)} data-testid="cart-checkout-btn" className="uf-btn-orange mt-4 w-full">
              Review &amp; Send Enquiry
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
