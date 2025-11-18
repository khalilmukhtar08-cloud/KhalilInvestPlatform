import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import propertyImg1 from "@assets/generated_images/Real_estate_property_placeholder_0bfd4ab9.png";
import propertyImg2 from "@assets/generated_images/Commercial_property_placeholder_3cde5200.png";

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  type: z.enum(["residential", "commercial", "land"]),
  location: z.string().min(3, "Location is required"),
  description: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string | null;
  status: "pending" | "approved" | "rejected";
  type: "residential" | "commercial" | "land";
  promoted: boolean;
}

export default function UserRealEstate() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: propertiesData, isLoading } = useQuery<{ properties: Property[] }>({
    queryKey: ["/api/properties"],
  });

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      price: 0,
      type: "residential",
      location: "",
      description: "",
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      return await apiRequest("POST", "/api/properties", data);
    },
    onSuccess: () => {
      toast({
        title: "Property listed successfully",
        description: "Your property has been submitted for admin approval ($10 fee applied)",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to list property",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: PropertyFormData) => {
    createPropertyMutation.mutate(data);
  };

  const properties = propertiesData?.properties || [];

  const defaultImages: Record<string, string> = {
    residential: propertyImg1,
    commercial: propertyImg2,
    land: propertyImg1,
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Real Estate</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-property">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <DialogHeader>
                  <DialogTitle>List New Property</DialogTitle>
                  <DialogDescription>
                    Add a property listing ($10 listing fee applies)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Modern Family Home"
                            data-testid="input-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="450000"
                              data-testid="input-price"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="City, State"
                            data-testid="input-location"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your property..."
                            rows={4}
                            data-testid="textarea-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createPropertyMutation.isPending}
                    data-testid="button-submit-property"
                  >
                    {createPropertyMutation.isPending ? "Submitting..." : "Submit Listing ($10 fee)"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full rounded-t-md" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              price={parseFloat(property.price)}
              image={property.image || defaultImages[property.type] || propertyImg1}
              onView={() => console.log(`View property ${property.id}`)}
              onEdit={() => console.log(`Edit property ${property.id}`)}
              onPromote={() => console.log(`Promote property ${property.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No properties yet. Click "Add Property" to list your first property.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
