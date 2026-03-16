// frontend/src/pages/CartPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // chuyển hẳn sang trang Đơn hàng, tab "Giỏ hàng của tôi"
    navigate("/orders?tab=cart", { replace: true });
  }, [navigate]);

  return null;
}
