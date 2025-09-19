"use client"

import { useState, useMemo } from "react"
import { Download, TrendingUp, Package, DollarSign, BarChart3, PieChart, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ReportsAnalyticsProps {
  inventoryItems: any[]
  transactions: any[]
}

interface SalesAnalytics {
  totalSales: number
  totalRevenue: number
  topSellingItems: Array<{ name: string; quantity: number; revenue: number }>
  salesByCategory: Array<{ category: string; quantity: number; revenue: number }>
  salesTrend: Array<{ date: string; sales: number; revenue: number }>
}

interface StockAnalytics {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  averageStockLevel: number
  stockTurnover: number
  wasteValue: number
}

interface SupplierAnalytics {
  suppliers: Array<{
    name: string
    itemsSupplied: number
    totalValue: number
    averageDeliveryTime: number
    reliability: number
  }>
}

export default function ReportsAnalytics({ inventoryItems, transactions }: ReportsAnalyticsProps) {
  const [dateRange, setDateRange] = useState("7d")
  const [reportType, setReportType] = useState("overview")

  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date()
    const daysBack = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    const filteredTransactions = transactions.filter((t) => t.timestamp >= startDate)
    const salesTransactions = filteredTransactions.filter((t) => t.type === "sale")
    const wasteTransactions = filteredTransactions.filter((t) => t.type === "waste")

    // Sales Analytics
    const salesAnalytics: SalesAnalytics = {
      totalSales: Math.abs(salesTransactions.reduce((sum, t) => sum + t.quantity, 0)),
      totalRevenue: salesTransactions.reduce((sum, t) => sum + Math.abs(t.quantity) * 120, 0), // Estimated revenue
      topSellingItems: [],
      salesByCategory: [],
      salesTrend: [],
    }

    // Stock Analytics
    const stockAnalytics: StockAnalytics = {
      totalItems: inventoryItems.length,
      totalValue: inventoryItems.reduce((sum, item) => sum + item.stockLevel * item.unitPrice, 0),
      lowStockItems: inventoryItems.filter((item) => item.stockLevel <= item.reorderPoint).length,
      outOfStockItems: inventoryItems.filter((item) => item.stockLevel === 0).length,
      averageStockLevel: inventoryItems.reduce((sum, item) => sum + item.stockLevel, 0) / inventoryItems.length,
      stockTurnover: salesAnalytics.totalSales / inventoryItems.length,
      wasteValue: wasteTransactions.reduce((sum, t) => sum + Math.abs(t.quantity) * 50, 0), // Estimated waste value
    }

    // Supplier Analytics
    const supplierMap = new Map()
    inventoryItems.forEach((item) => {
      if (!supplierMap.has(item.supplier)) {
        supplierMap.set(item.supplier, {
          name: item.supplier,
          itemsSupplied: 0,
          totalValue: 0,
          averageDeliveryTime: Math.floor(Math.random() * 5) + 2, // Mock data
          reliability: Math.floor(Math.random() * 20) + 80, // Mock data
        })
      }
      const supplier = supplierMap.get(item.supplier)
      supplier.itemsSupplied += 1
      supplier.totalValue += item.stockLevel * item.unitPrice
    })

    const supplierAnalytics: SupplierAnalytics = {
      suppliers: Array.from(supplierMap.values()).sort((a, b) => b.totalValue - a.totalValue),
    }

    return { salesAnalytics, stockAnalytics, supplierAnalytics }
  }, [inventoryItems, transactions, dateRange])

  const mockChartData = [
    { name: "Mon", sales: 45, revenue: 5400 },
    { name: "Tue", sales: 52, revenue: 6240 },
    { name: "Wed", sales: 38, revenue: 4560 },
    { name: "Thu", sales: 61, revenue: 7320 },
    { name: "Fri", sales: 73, revenue: 8760 },
    { name: "Sat", sales: 89, revenue: 10680 },
    { name: "Sun", sales: 67, revenue: 8040 },
  ]

  const categoryData = [
    { category: "Coffee", sales: 245, revenue: 36750, percentage: 65 },
    { category: "Pastry", sales: 89, revenue: 8010, percentage: 18 },
    { category: "Lunch", sales: 34, revenue: 5100, percentage: 9 },
    { category: "Drinks", sales: 56, revenue: 4480, percentage: 8 },
  ]

  const topItems = [
    { name: "Cappuccino", sales: 89, revenue: 13350, trend: "+12%" },
    { name: "Americano", sales: 76, revenue: 9880, trend: "+8%" },
    { name: "Espresso", sales: 65, revenue: 7800, trend: "+15%" },
    { name: "Latte", sales: 54, revenue: 8640, trend: "+5%" },
    { name: "Blueberry Muffin", sales: 43, revenue: 4085, trend: "-3%" },
  ]

  const reorderRecommendations = inventoryItems
    .filter((item) => item.stockLevel <= item.reorderPoint)
    .map((item) => ({
      ...item,
      recommendedQuantity: Math.max(item.reorderPoint * 2, 50),
      estimatedCost: Math.max(item.reorderPoint * 2, 50) * item.unitPrice,
      urgency: item.stockLevel === 0 ? "Critical" : item.stockLevel <= item.reorderPoint * 0.5 ? "High" : "Medium",
    }))
    .sort((a, b) => a.stockLevel - b.stockLevel)

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive inventory insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.salesAnalytics.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{analytics.salesAnalytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{analytics.stockAnalytics.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">-2%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Turnover</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.stockAnalytics.stockTurnover.toFixed(1)}x</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Performance</TabsTrigger>
          <TabsTrigger value="reorder">Reorder Recommendations</TabsTrigger>
          <TabsTrigger value="waste">Waste & Loss</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales and revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Sales trend chart would be displayed here</p>
                    <div className="mt-4 space-y-2">
                      {mockChartData.map((data, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{data.name}</span>
                          <span>{data.sales} sales</span>
                          <span>₱{data.revenue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Performance breakdown by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-gray-600">{category.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{category.sales} items</span>
                        <span>₱{category.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Best performing products in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sales}</TableCell>
                      <TableCell>₱{item.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={item.trend.startsWith("+") ? "default" : "secondary"}>{item.trend}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Level Distribution</CardTitle>
                <CardDescription>Current inventory status overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Well Stocked</span>
                    </div>
                    <span className="font-semibold">
                      {inventoryItems.filter((item) => item.stockLevel > item.reorderPoint).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Low Stock</span>
                    </div>
                    <span className="font-semibold">{analytics.stockAnalytics.lowStockItems}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Out of Stock</span>
                    </div>
                    <span className="font-semibold">{analytics.stockAnalytics.outOfStockItems}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Value Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Value by Category</CardTitle>
                <CardDescription>Asset distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Inventory value chart would be displayed here</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Coffee Beans: ₱45,250</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pastry: ₱8,420</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supplies: ₱12,680</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dairy: ₱3,150</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Movement Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement Analysis</CardTitle>
              <CardDescription>Detailed inventory transaction breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Last Restocked</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.stockLevel}</TableCell>
                      <TableCell>{item.reorderPoint}</TableCell>
                      <TableCell>{item.lastRestocked.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.stockLevel === 0
                              ? "destructive"
                              : item.stockLevel <= item.reorderPoint
                                ? "secondary"
                                : "default"
                          }
                        >
                          {item.stockLevel === 0
                            ? "Out of Stock"
                            : item.stockLevel <= item.reorderPoint
                              ? "Low Stock"
                              : "In Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance</CardTitle>
              <CardDescription>Evaluate supplier reliability and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items Supplied</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Avg Delivery Time</TableHead>
                    <TableHead>Reliability Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.supplierAnalytics.suppliers.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.itemsSupplied}</TableCell>
                      <TableCell>₱{supplier.totalValue.toLocaleString()}</TableCell>
                      <TableCell>{supplier.averageDeliveryTime} days</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            supplier.reliability >= 90
                              ? "default"
                              : supplier.reliability >= 80
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {supplier.reliability}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reorder Recommendations</CardTitle>
              <CardDescription>Automated suggestions for inventory restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {reorderRecommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Stock Levels Good!</h3>
                  <p className="text-gray-500">No items currently need restocking</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Recommended Quantity</TableHead>
                      <TableHead>Estimated Cost</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reorderRecommendations.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.stockLevel}</TableCell>
                        <TableCell>{item.recommendedQuantity}</TableCell>
                        <TableCell>₱{item.estimatedCost.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.urgency === "Critical"
                                ? "destructive"
                                : item.urgency === "High"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {item.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Create Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waste" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Waste & Loss Summary</CardTitle>
                <CardDescription>Track inventory waste and losses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">Total Waste Value</p>
                      <p className="text-sm text-gray-600">Current period</p>
                    </div>
                    <span className="text-2xl font-bold text-red-600">
                      ₱{analytics.stockAnalytics.wasteValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">Waste Percentage</p>
                      <p className="text-sm text-gray-600">Of total inventory</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">2.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waste by Category</CardTitle>
                <CardDescription>Breakdown of waste sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Expired Items</span>
                    <span className="font-medium">₱1,250</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Damaged Goods</span>
                    <span className="font-medium">₱850</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Spillage/Loss</span>
                    <span className="font-medium">₱420</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Other</span>
                    <span className="font-medium">₱180</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Waste Transactions</CardTitle>
              <CardDescription>Detailed waste and loss records</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter((t) => t.type === "waste")
                    .slice(0, 5)
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.timestamp.toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{transaction.itemName}</TableCell>
                        <TableCell>{Math.abs(transaction.quantity)}</TableCell>
                        <TableCell>{transaction.reason || "Not specified"}</TableCell>
                        <TableCell>₱{(Math.abs(transaction.quantity) * 50).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
