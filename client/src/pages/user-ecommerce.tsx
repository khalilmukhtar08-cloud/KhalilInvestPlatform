import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import productImg1 from "@assets/generated_images/E-commerce_product_placeholder_watch_ee4b2afc.png";
import productImg2 from "@assets/generated_images/E-commerce_product_placeholder_earbuds_15588067.png";

export default function UserEcommerce() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //todo: remove mock functionality
  const products = [
    { id: "1", name: "Luxury Smart Watch", price: 399, category: "Electronics", image: productImg1, status: "active" as const, stock: 45 },
    { id: "2", name: "Wireless Earbuds Pro", price: 159, category: "Electronics", image: productImg2, status: "active" as const, stock: 8 },
    { id: "3", name: "Premium Leather Bag", price: 249, category: "Fashion", image: productImg1, status: "pending" as const, stock: 12 },
    { id: "4", name: "Fitness Tracker", price: 89, category: "Electronics", image: productImg2, status: "active" as const, stock: 0 },
    { id: "5", name: "Designer Sunglasses", price: 179, category: "Fashion", image: productImg1, status: "flagged" as const, stock: 20 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New product submitted");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">E-commerce</h1>
          <p className="text-muted-foreground">Manage your products and sales</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  List a new product (5% commission on sales)
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="connect">Connect Store</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      placeholder="Luxury Smart Watch"
                      data-testid="input-name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="399"
                        data-testid="input-price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger id="category" data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="home">Home & Garden</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="100"
                      data-testid="input-stock"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your product..."
                      rows={4}
                      data-testid="textarea-description"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="connect" className="py-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Connect Your Store</CardTitle>
                      <CardDescription>
                        Integrate with Shopify or WooCommerce to sync products automatically
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full" data-testid="button-connect-shopify">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Connect Shopify Store
                      </Button>
                      <Button variant="outline" className="w-full" data-testid="button-connect-woocommerce">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Connect WooCommerce Store
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button type="submit" data-testid="button-submit-product">
                  Add Product
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
  );
}
