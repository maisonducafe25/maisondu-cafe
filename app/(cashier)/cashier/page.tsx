'use client';
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Banknote, CreditCard, Minus, Plus, Receipt, Search, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  image: string
  description: string
}

interface OrderItem extends MenuItem {
  quantity: number
  customizations?: string[]
}

const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Espresso",
    price: 120,
    category: "Coffee",
    image: "/espresso-coffee-cup.png",
    description: "Rich, bold espresso shot",
  },
  {
    id: "2",
    name: "Cappuccino",
    price: 150,
    category: "Coffee",
    image: "/placeholder-1hbg7.png",
    description: "Espresso with steamed milk and foam",
  },
  {
    id: "3",
    name: "Americano",
    price: 130,
    category: "Coffee",
    image: "/americano-black-coffee.jpg",
    description: "Espresso with hot water",
  },
  {
    id: "4",
    name: "Latte",
    price: 160,
    category: "Coffee",
    image: "/placeholder-ep5ty.png",
    description: "Espresso with steamed milk",
  },
  {
    id: "5",
    name: "Croissant",
    price: 80,
    category: "Pastry",
    image: "/placeholder-jbaje.png",
    description: "Buttery, flaky pastry",
  },
  {
    id: "6",
    name: "Blueberry Muffin",
    price: 95,
    category: "Pastry",
    image: "/blueberry-muffin.png",
    description: "Fresh blueberry muffin",
  },
]

const categories = ["All", "Coffee", "Pastry", "Lunch", "Drinks"]

export default function CashierPage() {

	const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital">("cash")
  const [cashReceived, setCashReceived] = useState("")

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToOrder = (item: MenuItem) => {
    const existingItem = orderItems.find((orderItem) => orderItem.id === item.id)
    if (existingItem) {
      setOrderItems(
        orderItems.map((orderItem) =>
          orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem,
        ),
      )
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1 }])
    }
  }

  const updateQuantity = (id: string, change: number) => {
    setOrderItems(
      orderItems
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change)
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean) as OrderItem[],
    )
  }

  const removeFromOrder = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id))
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.12 // 12% VAT
  const total = subtotal + tax
  const change = cashReceived ? Math.max(0, Number.parseFloat(cashReceived) - total) : 0

  const clearOrder = () => {
    setOrderItems([])
    setCashReceived("")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">maisondu café - POS System</h1>
          <p className="text-gray-600">Cashier Interface</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle className="text-2xl">Menu</CardTitle>
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="rounded-full"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToOrder(item)}
                    >
                      <CardContent className="p-4">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-orange-600">₱{item.price}</span>
                          <Button size="sm" className="rounded-full">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Section */}
          <div className="space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order Details
                  {orderItems.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearOrder}>
                      Clear
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items in order</p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">₱{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₱{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            {orderItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (12%)</span>
                    <span>₱{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₱{total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment */}
            {orderItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={paymentMethod === "cash" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("cash")}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Banknote className="w-6 h-6 mb-1" />
                      <span className="text-xs">Cash</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "card" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("card")}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <CreditCard className="w-6 h-6 mb-1" />
                      <span className="text-xs">Card</span>
                    </Button>
                    <Button
                      variant={paymentMethod === "digital" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("digital")}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Smartphone className="w-6 h-6 mb-1" />
                      <span className="text-xs">Digital</span>
                    </Button>
                  </div>

                  {/* Cash Payment Details */}
                  {paymentMethod === "cash" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Cash Received</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          className="text-lg"
                        />
                      </div>
                      {cashReceived && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Change</span>
                            <span className="text-green-600">₱{change.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Digital Payment Options */}
                  {paymentMethod === "digital" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start bg-transparent">
                        <span className="text-blue-600 font-bold mr-2">G</span>
                        GCash
                      </Button>
                      <Button variant="outline" className="justify-start bg-transparent">
                        <span className="text-green-600 font-bold mr-2">M</span>
                        Maya
                      </Button>
                    </div>
                  )}

                  {/* Place Order Button */}
                  <Button
                    className="w-full text-lg py-6"
                    size="lg"
                    disabled={paymentMethod === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < total)}
                  >
                    <Receipt className="w-5 h-5 mr-2" />
                    Place Order
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
