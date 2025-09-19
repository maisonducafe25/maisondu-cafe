"use client"

import { useState, useEffect } from "react"
import { Bell, AlertTriangle, Settings, X, Check, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AlertRule {
  id: string
  itemId: string
  itemName: string
  alertType: "low_stock" | "out_of_stock" | "expiring_soon"
  threshold: number
  isActive: boolean
  notificationMethods: ("email" | "sms" | "in_app")[]
  recipients: string[]
  lastTriggered?: Date
}

interface StockAlert {
  id: string
  itemId: string
  itemName: string
  alertType: "low_stock" | "out_of_stock" | "expiring_soon"
  currentStock: number
  threshold: number
  severity: "low" | "medium" | "high" | "critical"
  message: string
  timestamp: Date
  isRead: boolean
  isResolved: boolean
}

const mockAlertRules: AlertRule[] = [
  {
    id: "1",
    itemId: "1",
    itemName: "Espresso Beans (Premium)",
    alertType: "low_stock",
    threshold: 20,
    isActive: true,
    notificationMethods: ["email", "in_app"],
    recipients: ["manager@maisondcafe.com"],
    lastTriggered: new Date("2024-01-17T09:00:00"),
  },
  {
    id: "2",
    itemId: "6",
    itemName: "Paper Cups (16oz)",
    alertType: "low_stock",
    threshold: 25,
    isActive: true,
    notificationMethods: ["email", "sms", "in_app"],
    recipients: ["manager@maisondcafe.com", "staff@maisondcafe.com"],
  },
  {
    id: "3",
    itemId: "3",
    itemName: "Blueberry Muffins",
    alertType: "expiring_soon",
    threshold: 2, // days
    isActive: true,
    notificationMethods: ["in_app"],
    recipients: ["kitchen@maisondcafe.com"],
  },
]

const mockActiveAlerts: StockAlert[] = [
  {
    id: "1",
    itemId: "6",
    itemName: "Paper Cups (16oz)",
    alertType: "low_stock",
    currentStock: 5,
    threshold: 25,
    severity: "high",
    message: "Paper Cups (16oz) stock is critically low (5 units remaining, reorder at 25)",
    timestamp: new Date("2024-01-18T08:30:00"),
    isRead: false,
    isResolved: false,
  },
  {
    id: "2",
    itemId: "2",
    itemName: "Americano Blend",
    alertType: "low_stock",
    currentStock: 12,
    threshold: 15,
    severity: "medium",
    message: "Americano Blend is running low (12 units remaining, reorder at 15)",
    timestamp: new Date("2024-01-18T07:15:00"),
    isRead: true,
    isResolved: false,
  },
  {
    id: "3",
    itemId: "3",
    itemName: "Blueberry Muffins",
    alertType: "expiring_soon",
    currentStock: 8,
    threshold: 2,
    severity: "medium",
    message: "Blueberry Muffins will expire in 1 day",
    timestamp: new Date("2024-01-18T06:00:00"),
    isRead: false,
    isResolved: false,
  },
]

interface AlertsSystemProps {
  inventoryItems: any[]
}

export default function AlertsSystem({ inventoryItems }: AlertsSystemProps) {
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules)
  const [activeAlerts, setActiveAlerts] = useState<StockAlert[]>(mockActiveAlerts)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false)
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    alertType: "low_stock",
    threshold: 10,
    isActive: true,
    notificationMethods: ["in_app"],
    recipients: [],
  })

  // Simulate real-time alert checking
  useEffect(() => {
    const checkAlerts = () => {
      const newAlerts: StockAlert[] = []

      inventoryItems.forEach((item) => {
        const rules = alertRules.filter((rule) => rule.itemId === item.id && rule.isActive)

        rules.forEach((rule) => {
          let shouldAlert = false
          let severity: StockAlert["severity"] = "low"
          let message = ""

          if (rule.alertType === "low_stock" && item.stockLevel <= rule.threshold) {
            shouldAlert = true
            if (item.stockLevel === 0) {
              severity = "critical"
              message = `${item.name} is out of stock`
            } else if (item.stockLevel <= rule.threshold * 0.3) {
              severity = "high"
              message = `${item.name} stock is critically low (${item.stockLevel} units remaining, reorder at ${rule.threshold})`
            } else {
              severity = "medium"
              message = `${item.name} is running low (${item.stockLevel} units remaining, reorder at ${rule.threshold})`
            }
          }

          if (shouldAlert) {
            const existingAlert = activeAlerts.find(
              (alert) => alert.itemId === item.id && alert.alertType === rule.alertType && !alert.isResolved,
            )

            if (!existingAlert) {
              newAlerts.push({
                id: Date.now().toString() + Math.random(),
                itemId: item.id,
                itemName: item.name,
                alertType: rule.alertType,
                currentStock: item.stockLevel,
                threshold: rule.threshold,
                severity,
                message,
                timestamp: new Date(),
                isRead: false,
                isResolved: false,
              })
            }
          }
        })
      })

      if (newAlerts.length > 0) {
        setActiveAlerts((prev) => [...newAlerts, ...prev])
      }
    }

    const interval = setInterval(checkAlerts, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [inventoryItems, alertRules, activeAlerts])

  const unreadAlertsCount = activeAlerts.filter((alert) => !alert.isRead && !alert.isResolved).length
  const criticalAlertsCount = activeAlerts.filter((alert) => alert.severity === "critical" && !alert.isResolved).length

  const handleMarkAsRead = (alertId: string) => {
    setActiveAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)))
  }

  const handleResolveAlert = (alertId: string) => {
    setActiveAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, isResolved: true, isRead: true } : alert)),
    )
  }

  const handleCreateRule = () => {
    if (newRule.itemId && newRule.threshold) {
      const rule: AlertRule = {
        id: Date.now().toString(),
        itemId: newRule.itemId,
        itemName: inventoryItems.find((item) => item.id === newRule.itemId)?.name || "",
        alertType: newRule.alertType || "low_stock",
        threshold: newRule.threshold,
        isActive: newRule.isActive || true,
        notificationMethods: newRule.notificationMethods || ["in_app"],
        recipients: newRule.recipients || [],
      }

      setAlertRules((prev) => [...prev, rule])
      setIsCreateRuleOpen(false)
      setNewRule({
        alertType: "low_stock",
        threshold: 10,
        isActive: true,
        notificationMethods: ["in_app"],
        recipients: [],
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "high":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "low":
        return <Package className="w-4 h-4 text-blue-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.filter((a) => !a.isResolved).length}</div>
            <p className="text-xs text-muted-foreground">Unresolved alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlertsCount}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alert Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertRules.filter((r) => r.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Active monitoring rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlertsCount > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalAlertsCount} critical alerts</strong> require immediate attention. Some items are out of
            stock or critically low.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active-alerts" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active-alerts" className="relative">
              Active Alerts
              {unreadAlertsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                  {unreadAlertsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active-alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Current stock alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAlerts
                  .filter((alert) => !alert.isResolved)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-4 p-4 border rounded-lg ${!alert.isRead ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"}`}
                    >
                      <div className="flex-shrink-0 mt-1">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{alert.itemName}</span>
                          <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {!alert.isRead && (
                            <Badge variant="outline" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        <div className="text-xs text-gray-500">{alert.timestamp.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        {!alert.isRead && (
                          <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(alert.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleResolveAlert(alert.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                {activeAlerts.filter((alert) => !alert.isResolved).length === 0 && (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
                    <p className="text-gray-500">No active alerts at the moment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
