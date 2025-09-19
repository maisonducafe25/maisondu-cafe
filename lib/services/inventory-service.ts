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

// Mock inventory data - in a real app this would come from a database
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

// Menu item to inventory mapping
const menuToInventoryMapping: Record<string, { inventoryId: string; quantityUsed: number }[]> = {
  "1": [
    { inventoryId: "1", quantityUsed: 1 },
    { inventoryId: "6", quantityUsed: 1 },
  ], // Espresso
  "2": [
    { inventoryId: "1", quantityUsed: 1 },
    { inventoryId: "4", quantityUsed: 0.2 },
    { inventoryId: "6", quantityUsed: 1 },
  ], // Cappuccino
  "3": [
    { inventoryId: "2", quantityUsed: 1 },
    { inventoryId: "6", quantityUsed: 1 },
  ], // Americano
  "4": [
    { inventoryId: "1", quantityUsed: 1 },
    { inventoryId: "4", quantityUsed: 0.3 },
    { inventoryId: "6", quantityUsed: 1 },
  ], // Latte
  "5": [{ inventoryId: "6", quantityUsed: 1 }], // Croissant (uses cup for packaging)
  "6": [{ inventoryId: "3", quantityUsed: 1 }], // Blueberry Muffin
}

class InventoryService {
  private inventory: InventoryItem[] = [...mockInventoryData]
  private transactions: StockTransaction[] = []
  private listeners: Array<(inventory: InventoryItem[]) => void> = []

  // Subscribe to inventory changes
  subscribe(listener: (inventory: InventoryItem[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener([...this.inventory]))
  }

  // Get current inventory
  getInventory(): InventoryItem[] {
    return [...this.inventory]
  }

  // Get inventory item by ID
  getInventoryItem(id: string): InventoryItem | undefined {
    return this.inventory.find((item) => item.id === id)
  }

  // Check if menu item can be made (has sufficient stock)
  canMakeMenuItem(menuItemId: string, quantity = 1): { canMake: boolean; missingItems: string[] } {
    const requiredItems = menuToInventoryMapping[menuItemId] || []
    const missingItems: string[] = []

    for (const required of requiredItems) {
      const inventoryItem = this.getInventoryItem(required.inventoryId)
      if (!inventoryItem || inventoryItem.stockLevel < required.quantityUsed * quantity) {
        missingItems.push(inventoryItem?.name || `Item ${required.inventoryId}`)
      }
    }

    return {
      canMake: missingItems.length === 0,
      missingItems,
    }
  }

  // Get stock level for menu item (minimum stock available based on ingredients)
  getMenuItemStock(menuItemId: string): number {
    const requiredItems = menuToInventoryMapping[menuItemId] || []
    if (requiredItems.length === 0) return 999 // No inventory tracking for this item

    let minStock = Number.POSITIVE_INFINITY
    for (const required of requiredItems) {
      const inventoryItem = this.getInventoryItem(required.inventoryId)
      if (!inventoryItem) return 0

      const availableQuantity = Math.floor(inventoryItem.stockLevel / required.quantityUsed)
      minStock = Math.min(minStock, availableQuantity)
    }

    return minStock === Number.POSITIVE_INFINITY ? 0 : minStock
  }

  // Process sale - deduct inventory when items are sold
  processSale(menuItemId: string, quantity: number, userId = "pos", userName = "POS System"): boolean {
    const { canMake } = this.canMakeMenuItem(menuItemId, quantity)
    if (!canMake) return false

    const requiredItems = menuToInventoryMapping[menuItemId] || []
    const transactions: StockTransaction[] = []

    // Create transactions for each inventory item used
    for (const required of requiredItems) {
      const inventoryItem = this.getInventoryItem(required.inventoryId)
      if (!inventoryItem) continue

      const quantityUsed = required.quantityUsed * quantity
      const newStock = inventoryItem.stockLevel - quantityUsed

      const transaction: StockTransaction = {
        id: Date.now().toString() + Math.random(),
        itemId: inventoryItem.id,
        itemName: inventoryItem.name,
        type: "sale",
        quantity: -quantityUsed,
        previousStock: inventoryItem.stockLevel,
        newStock,
        reason: `Sale: ${quantity}x menu item ${menuItemId}`,
        timestamp: new Date(),
        userId,
        userName,
      }

      transactions.push(transaction)
    }

    // Apply all transactions
    for (const transaction of transactions) {
      this.inventory = this.inventory.map((item) =>
        item.id === transaction.itemId ? { ...item, stockLevel: transaction.newStock } : item,
      )
      this.transactions.push(transaction)
    }

    this.notifyListeners()
    return true
  }

  // Update stock level
  updateStock(itemId: string, newStock: number, reason: string, userId = "user", userName = "Staff"): boolean {
    const item = this.getInventoryItem(itemId)
    if (!item) return false

    const transaction: StockTransaction = {
      id: Date.now().toString() + Math.random(),
      itemId,
      itemName: item.name,
      type: newStock > item.stockLevel ? "restock" : "adjustment",
      quantity: newStock - item.stockLevel,
      previousStock: item.stockLevel,
      newStock,
      reason,
      timestamp: new Date(),
      userId,
      userName,
    }

    this.inventory = this.inventory.map((inventoryItem) =>
      inventoryItem.id === itemId
        ? { ...inventoryItem, stockLevel: newStock, lastRestocked: new Date() }
        : inventoryItem,
    )

    this.transactions.push(transaction)
    this.notifyListeners()
    return true
  }

  // Get transaction history
  getTransactions(): StockTransaction[] {
    return [...this.transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Get low stock items
  getLowStockItems(): InventoryItem[] {
    return this.inventory.filter((item) => item.stockLevel <= item.reorderPoint)
  }

  // Get out of stock items
  getOutOfStockItems(): InventoryItem[] {
    return this.inventory.filter((item) => item.stockLevel === 0)
  }
}

// Create singleton instance
export const inventoryService = new InventoryService()
export type { InventoryItem, StockTransaction }
