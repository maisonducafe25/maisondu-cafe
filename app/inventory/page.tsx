"use client"

import { useState } from "react"
import { Search, Plus, AlertTriangle, Package, TrendingUp, TrendingDown, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AlertsSystem from "@/components/inventory/alerts-system"
import StockManagement from "@/components/inventory/stock-management"
import ReportsAnalytics from "@/components/inventory/reports-analytics"
import { inventoryService } from "@/lib/services/inventory-service"

interface InventoryItem {
  id: string
  name: string
  category: string
  stockLevel: number
  reorderPoint: number
  unitPrice: number
  supplier: string
  lastRestocked: Date
  isActive: boolean
  image: string
  description: string
}

const mockInventoryData: InventoryItem[] = [
  {
    id: "1",
    name: "Espresso Beans (Premium)",
    category: "Coffee Beans",
    stockLevel: 45,
    reorderPoint: 20,
    unitPrice: 850,
    supplier: "Mountain Coffee Co.",
    lastRestocked: new Date("2024-01-15"),
    isActive: true,
    image: "/espresso-coffee-cup.png",
    description: "Premium arabica espresso beans",
  },
  {
    id: "2",
    name: "Americano Blend",
    category: "Coffee Beans",
    stockLevel: 12,
    reorderPoint: 15,
    unitPrice: 650,
    supplier: "Local Roasters",
    lastRestocked: new Date("2024-01-10"),
    isActive: true,
    image: "/americano-black-coffee.jpg",
    description: "Medium roast americano blend",
  },
  {
    id: "3",
    name: "Blueberry Muffins",
    category: "Pastry",
    stockLevel: 8,
    reorderPoint: 12,
    unitPrice: 45,
    supplier: "Fresh Bakery",
    lastRestocked: new Date("2024-01-18"),
    isActive: true,
    image: "/blueberry-muffin.png",
    description: "Fresh blueberry muffins",
  },
  {
    id: "4",
    name: "Whole Milk (1L)",
    category: "Dairy",
    stockLevel: 25,
    reorderPoint: 10,
    unitPrice: 85,
    supplier: "Dairy Fresh",
    lastRestocked: new Date("2024-01-17"),
    isActive: true,
    image: "/placeholder-1hbg7.png",
    description: "Fresh whole milk for beverages",
  },
  {
    id: "5",
    name: "Sugar Packets",
    category: "Supplies",
    stockLevel: 150,
    reorderPoint: 50,
    unitPrice: 2,
    supplier: "Supply Co.",
    lastRestocked: new Date("2024-01-12"),
    isActive: true,
    image: "/placeholder-ep5ty.png",
    description: "Individual sugar packets",
  },
  {
    id: "6",
    name: "Paper Cups (16oz)",
    category: "Supplies",
    stockLevel: 5,
    reorderPoint: 25,
    unitPrice: 15,
    supplier: "EcoCup Solutions",
    lastRestocked: new Date("2024-01-08"),
    isActive: true,
    image: "/placeholder-jbaje.png",
    description: "Eco-friendly paper cups",
  },
]

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventoryData)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isRestockOpen, setIsRestockOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockQuantity, setRestockQuantity] = useState("")

  // Filter inventory based on search and filters
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && item.stockLevel <= item.reorderPoint) ||
      (stockFilter === "out" && item.stockLevel === 0) ||
      (stockFilter === "good" && item.stockLevel > item.reorderPoint)

    return matchesSearch && matchesCategory && matchesStock
  })

  // Calculate dashboard stats
  const totalItems = inventory.length
  const lowStockItems = inventory.filter((item) => item.stockLevel <= item.reorderPoint).length
  const outOfStockItems = inventory.filter((item) => item.stockLevel === 0).length
  const totalValue = inventory.reduce((sum, item) => sum + item.stockLevel * item.unitPrice, 0)

  const categories = [...new Set(inventory.map((item) => item.category))]

  const handleRestock = () => {
    if (selectedItem && restockQuantity) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, stockLevel: item.stockLevel + Number.parseInt(restockQuantity), lastRestocked: new Date() }
            : item,
        ),
      )
      setIsRestockOpen(false)
      setRestockQuantity("")
      setSelectedItem(null)
    }
  }

  const handleStockUpdate = (itemId: string, newStock: number, transaction: any) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, stockLevel: newStock, lastRestocked: new Date() } : item)),
    )
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.stockLevel === 0) return { status: "Out of Stock", color: "destructive" as const }
    if (item.stockLevel <= item.reorderPoint) return { status: "Low Stock", color: "secondary" as const }
    return { status: "In Stock", color: "default" as const }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Track and manage your coffee shop inventory</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>Add a new item to your inventory system.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coffee-beans">Coffee Beans</SelectItem>
                        <SelectItem value="pastry">Pastry</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">
                      Stock Level
                    </Label>
                    <Input id="stock" type="number" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reorder" className="text-right">
                      Reorder Point
                    </Label>
                    <Input id="reorder" type="number" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Unit Price
                    </Label>
                    <Input id="price" type="number" step="0.01" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplier" className="text-right">
                      Supplier
                    </Label>
                    <Input id="supplier" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Active inventory items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">Items unavailable</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Current inventory value</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>{lowStockItems} items</strong> are running low on stock and need to be restocked soon.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
            <TabsTrigger value="stock-management">Stock Management</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Monitoring</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>Manage your coffee shop inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search items, categories, or suppliers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Stock Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="good">In Stock</SelectItem>
                      <SelectItem value="low">Low Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Inventory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item)
                    return (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                                  <p className="text-xs text-gray-500">{item.category}</p>
                                  <p className="text-xs text-gray-400">{item.supplier}</p>
                                </div>
                                <Badge variant={stockStatus.color} className="text-xs">
                                  {stockStatus.status}
                                </Badge>
                              </div>

                              <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Stock:</span>
                                  <span
                                    className={`font-medium ${item.stockLevel <= item.reorderPoint ? "text-orange-600" : "text-green-600"}`}
                                  >
                                    {item.stockLevel} units
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Reorder at:</span>
                                  <span>{item.reorderPoint} units</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Unit Price:</span>
                                  <span className="font-medium">₱{item.unitPrice}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Last Restocked:</span>
                                  <span>{item.lastRestocked.toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div className="mt-3 flex gap-2">
                                <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 text-xs bg-transparent"
                                      onClick={() => setSelectedItem(item)}
                                    >
                                      Restock
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Restock Item</DialogTitle>
                                      <DialogDescription>Add stock for {selectedItem?.name}</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="quantity" className="text-right">
                                          Quantity
                                        </Label>
                                        <Input
                                          id="quantity"
                                          type="number"
                                          value={restockQuantity}
                                          onChange={(e) => setRestockQuantity(e.target.value)}
                                          className="col-span-3"
                                          placeholder="Enter quantity to add"
                                        />
                                      </div>
                                      {selectedItem && (
                                        <div className="text-sm text-gray-600">
                                          Current stock: {selectedItem.stockLevel} units
                                          <br />
                                          New stock will be:{" "}
                                          {selectedItem.stockLevel + (Number.parseInt(restockQuantity) || 0)} units
                                        </div>
                                      )}
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={handleRestock}>Confirm Restock</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button size="sm" variant="ghost" className="flex-1 text-xs">
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {filteredInventory.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock-management">
            {/* Stock Management Component */}
            <StockManagement inventoryItems={inventory} onStockUpdate={handleStockUpdate} />
          </TabsContent>

          <TabsContent value="alerts">
            {/* Alerts System Component */}
            <AlertsSystem inventoryItems={inventory} />
          </TabsContent>

          <TabsContent value="reports">
            {/* Reports & Analytics Component */}
            <ReportsAnalytics inventoryItems={inventory} transactions={inventoryService.getTransactions()} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
