import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { CartProvider } from "@/store/CartContext";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import CartDrawer from "@/components/site/CartDrawer";
import Home from "@/pages/Home";
import Baskets from "@/pages/Baskets";
import Gifting from "@/pages/Gifting";
import HamperDetail from "@/pages/HamperDetail";
import FruitDetail from "@/pages/FruitDetail";
import Checkout from "@/pages/Checkout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import Inventory from "@/pages/admin/Inventory";
import Enquiries from "@/pages/admin/Enquiries";
import Customers from "@/pages/admin/Customers";
import SettingsPage from "@/pages/admin/SettingsPage";

const Storefront = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
    <CartDrawer />
  </>
);

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin)
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    );

  return (
    <Storefront>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/baskets" element={<Baskets />} />
        <Route path="/gifting" element={<Gifting />} />
        <Route path="/hampers/:slug" element={<HamperDetail />} />
        <Route path="/fruits" element={<FruitDetail />} />
        <Route path="/fruits/:slug" element={<FruitDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Storefront>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Shell />
        <Toaster position="top-center" richColors />
      </CartProvider>
    </BrowserRouter>
  );
}
