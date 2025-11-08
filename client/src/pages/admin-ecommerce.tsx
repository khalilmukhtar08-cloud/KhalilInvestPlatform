import { ProductCard } from "@/components/product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import productImg1 from "@assets/generated_images/E-commerce_product_placeholder_watch_ee4b2afc.png";
import productImg2 from "@assets/generated_images/E-commerce_product_placeholder_earbuds_15588067.png";

export default function AdminEcommerce() {
  //todo: remove mock functionality
  const products = [
    { id: "1", name: "Luxury Smart Watch", price: 399, category: "Electronics", image: productImg1, status: "active" as const, stock: 45 },
    { id: "2", name: "Wireless Earbuds Pro", price: 159, category: "Electronics", image: productImg2, status: "pending" as const, stock: 8 },
    { id: "3", name: "Premium Leather Bag", price: 249, category: "Fashion", image: productImg1, status: "flagged" as const, stock: 12 },
    { id: "4", name: "Fitness Tracker", price: 89, category: "Electronics", image: productImg2, status: "active" as const, stock: 0 },
    { id: "5", name: "Designer Sunglasses", price: 179, category: "Fashion", image: productImg1, status: "pending" as const, stock: 20 },
    { id: "6", name: "Bluetooth Speaker", price: 129, category: "Electronics", image: productImg2, status: "active" as const, stock: 35 },
  ];

  const activeCount = products.filter(p => p.status === "active").length;
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  const flaggedCount = products.filter(p => p.status === "flagged").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">E-commerce Management</h1>
        <p className="text-muted-foreground">Manage products and sellers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono">{activeCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-accent">
              ${(totalRevenue / 1000).toFixed(1)}K
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Products</CardTitle>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-mono text-destructive">{flaggedCount}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold font-serif mb-4">All Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onView={() => console.log(`View product ${product.id}`)}
              onEdit={() => console.log(`Edit product ${product.id}`)}
              onMore={() => console.log(`More options for product ${product.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
