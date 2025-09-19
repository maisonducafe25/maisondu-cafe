"use client"

import { useState } from "react"
import { Plus, Minus, Package, AlertTriangle, CheckCircle, Clock, Search } from "lucide-react"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StockTransaction {
  id: string
  itemId: string
  itemName: string
  type: "restock" | "sale" | "waste" | "adjustment"
  quantity: number
  previousStock: number
  newStock: number
  reason?: string
  timestamp: Date
  userId: string
  userName: string
}

interface StockAdjustment {
  itemId: string
  currentStock: number
  adjustedStock: number
  reason: string
  type: "increase" | "decrease"
}

const mockTransactions: StockTransaction[] = [
  {
    id: "1",
    itemId: "1",
    itemName: "Espresso Beans (Premium)",
    type: "restock",
    quantity: 20,
    previousStock: 25,
    newStock: 45,
    reason: "Weekly delivery",
    timestamp: new Date("2024-01-18T10:30:00"),
    userId: "user1",
    userName: "Maria Santos",
  },
  {
    id: "2",
    itemId: "2",
    itemName: "Americano Blend",
    type: "sale",
    quantity: -3,
    previousStock: 15,
    newStock: 12,
    timestamp: new Date("2024-01-18T14:15:00"),
    userId: "pos",
    userName: "POS System",
  },
  {
    id: "3",
    itemId: "6",
    itemName: "Paper Cups (16oz)",
    type: "waste",
    quantity: -5,
    previousStock: 10,
    newStock: 5,
    reason: "Damaged during delivery",
    timestamp: new Date("2024-01-17T16:45:00"),
    userId: "user2",
    userName: "John Doe",
  },
  {
    id: "4",
    itemId: "3",
    itemName: "Blueberry Muffins",
    type: "adjustment",
    quantity: -2,
    previousStock: 10,
    newStock: 8,
    reason: "Inventory count correction",
    timestamp: new Date("2024-01-17T09:00:00"),
    userId: "user1",
    userName: "Maria Santos",
  },
]

interface StockManagementProps {
  inventoryItems: any[]
  onStockUpdate: (itemId: string, newStock: number, transaction: Omit<StockTransaction, "id" | "timestamp">) => void
}

export default function StockManagement({ inventoryItems, onStockUpdate }: StockManagementProps) {
  const [transactions, setTransactions] = useState<StockTransaction[]>(mockTransactions)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false)
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState<StockAdjustment>({
    itemId: "",
    currentStock: 0,
    adjustedStock: 0,
    reason: "",
    type: "increase",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [transactionFilter, setTransactionFilter] = useState("all")

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reason?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = transactionFilter === "all" || transaction.type === transactionFilter

    return matchesSearch && matchesFilter
  })

  const handleStockAdjustment = () => {
    if (!selectedItem || !adjustmentData.reason) return

    const quantity = adjustmentData.adjustedStock - adjustmentData.currentStock
    const newTransaction: Omit<StockTransaction, "id" | "timestamp"> = {
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: "adjustment",
      quantity,
      previousStock: adjustmentData.currentStock,
      newStock: adjustmentData.adjustedStock,
      reason: adjustmentData.reason,
      userId: "user1",
      userName: "Current User",
    }

    // Add to transactions
    const transaction: StockTransaction = {
      ...newTransaction,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setTransactions((prev) => [transaction, ...prev])

    // Update inventory
    onStockUpdate(selectedItem.id, adjustmentData.adjustedStock, newTransaction)

    // Reset form
    setIsAdjustmentOpen(false)
    setSelectedItem(null)
    setAdjustmentData({
      itemId: "",
      currentStock: 0,
      adjustedStock: 0,
      reason: "",
      type: "increase",
    })
  }

  const handleQuickAdjustment = (item: any, change: number, reason: string) => {
    const newStock = Math.max(0, item.stockLevel + change)
    const transaction: Omit<StockTransaction, "id" | "timestamp"> = {
      itemId: item.id,
      itemName: item.name,
      type: change > 0 ? "restock" : "adjustment",
      quantity: change,
      previousStock: item.stockLevel,
      newStock,
      reason,
      userId: "user1",
      userName: "Current User",
    }

    const fullTransaction: StockTransaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setTransactions((prev) => [fullTransaction, ...prev])
    onStockUpdate(item.id, newStock, transaction)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "restock":
        return <Plus className="w-4 h-4 text-green-600" />
      case "sale":
        return <Minus className="w-4 h-4 text-blue-600" />
      case "waste":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "adjustment":
        return <Package className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "restock":
        return "default"
      case "sale":
        return "secondary"
      case "waste":
        return "destructive"
      case "adjustment":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="quick-actions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="transaction-history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stock Actions</CardTitle>
              <CardDescription>Quickly adjust stock levels for individual items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventoryItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500">{item.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">Stock: {item.stockLevel}</span>
                            {item.stockLevel <= item.reorderPoint && (
                              <Badge variant="secondary" className="text-xs">
                                Low
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => handleQuickAdjustment(item, -1, "Quick decrease")}
                            disabled={item.stockLevel === 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => handleQuickAdjustment(item, 1, "Quick increase")}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full"
                          onClick={() => {
                            setSelectedItem(item)
                            setAdjustmentData({
                              itemId: item.id,
                              currentStock: item.stockLevel,
                              adjustedStock: item.stockLevel,
                              reason: "",
                              type: "increase",
                            })
                            setIsAdjustmentOpen(true)
                          }}
                        >
                          Detailed Adjustment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transaction-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Transaction History</CardTitle>
              <CardDescription>View all stock movements and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="restock">Restocks</SelectItem>
                    <SelectItem value="sale">Sales</SelectItem>
                    <SelectItem value="waste">Waste</SelectItem>
                    <SelectItem value="adjustment">Adjustments</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">{getTransactionIcon(transaction.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{transaction.itemName}</span>
                        <Badge variant={getTransactionColor(transaction.type) as any} className="text-xs">
                          {transaction.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span>{transaction.userName} • </span>
                        <span>{transaction.timestamp.toLocaleString()}</span>
                        {transaction.reason && <span> • {transaction.reason}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${transaction.quantity > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.quantity > 0 ? "+" : ""}
                        {transaction.quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.previousStock} → {transaction.newStock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock Adjustment</DialogTitle>
            <DialogDescription>Adjust stock level for {selectedItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current" className="text-right">
                Current Stock
              </Label>
              <Input id="current" type="number" value={adjustmentData.currentStock} disabled className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjusted" className="text-right">
                New Stock
              </Label>
              <Input
                id="adjusted"
                type="number"
                value={adjustmentData.adjustedStock}
                onChange={(e) =>
                  setAdjustmentData((prev) => ({
                    ...prev,
                    adjustedStock: Number.parseInt(e.target.value) || 0,
                  }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={adjustmentData.reason}
                onChange={(e) =>
                  setAdjustmentData((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                className="col-span-3"
                placeholder="Explain the reason for this adjustment..."
              />
            </div>
            <div className="text-sm text-gray-600 col-span-4">
              Change: {adjustmentData.adjustedStock - adjustmentData.currentStock > 0 ? "+" : ""}
              {adjustmentData.adjustedStock - adjustmentData.currentStock} units
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleStockAdjustment} disabled={!adjustmentData.reason}>
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
