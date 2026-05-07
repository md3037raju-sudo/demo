'use client'

import { useState } from 'react'
import { mockPlans } from '@/lib/mock-data'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Pencil,
  Trash2,
  Zap,
  Gauge,
  HardDrive,
  MonitorSmartphone,
  DollarSign,
  Calendar,
  Users,
} from 'lucide-react'

// Types
interface Plan {
  id: string
  name: string
  speed: string
  dataLimit: string
  maxDevices: number
  price: number
  period: 'Monthly' | 'Yearly'
  isActive: boolean
  subscribers: number
}

// Default form
const defaultForm = {
  name: '',
  speed: '',
  dataLimit: '',
  maxDevices: 1,
  price: 0,
  period: 'Monthly' as Plan['period'],
  isActive: true,
}

export function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>(
    mockPlans.map((p) => ({ ...p, period: p.period as Plan['period'] }))
  )

  // Dialog states
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [planForm, setPlanForm] = useState(defaultForm)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)

  // Open create dialog
  const openCreatePlan = () => {
    setEditingPlan(null)
    setPlanForm(defaultForm)
    setPlanDialogOpen(true)
  }

  // Open edit dialog
  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan)
    setPlanForm({
      name: plan.name,
      speed: plan.speed,
      dataLimit: plan.dataLimit,
      maxDevices: plan.maxDevices,
      price: plan.price,
      period: plan.period,
      isActive: plan.isActive,
    })
    setPlanDialogOpen(true)
  }

  // Save plan (create or update)
  const savePlan = () => {
    if (!planForm.name.trim()) {
      toast.error('Plan name is required')
      return
    }
    if (!planForm.speed.trim()) {
      toast.error('Speed is required')
      return
    }

    if (editingPlan) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlan.id
            ? {
                ...p,
                name: planForm.name,
                speed: planForm.speed,
                dataLimit: planForm.dataLimit,
                maxDevices: planForm.maxDevices,
                price: planForm.price,
                period: planForm.period,
                isActive: planForm.isActive,
              }
            : p
        )
      )
      toast.success('Plan updated successfully')
    } else {
      const newPlan: Plan = {
        id: `plan_${Date.now()}`,
        name: planForm.name,
        speed: planForm.speed,
        dataLimit: planForm.dataLimit,
        maxDevices: planForm.maxDevices,
        price: planForm.price,
        period: planForm.period,
        isActive: planForm.isActive,
        subscribers: 0,
      }
      setPlans((prev) => [...prev, newPlan])
      toast.success('Plan created successfully')
    }
    setPlanDialogOpen(false)
  }

  // Delete plan
  const confirmDeletePlan = (id: string) => {
    setDeletingPlanId(id)
    setDeleteDialogOpen(true)
  }

  const deletePlan = () => {
    setPlans((prev) => prev.filter((p) => p.id !== deletingPlanId))
    setDeleteDialogOpen(false)
    toast.success('Plan deleted')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plan Management</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage subscription plans for your users
          </p>
        </div>
        <Button onClick={openCreatePlan} className="gap-2">
          <Plus className="size-4" />
          Create New Plan
        </Button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-colors ${
              plan.isActive ? 'hover:border-emerald-500/50' : 'opacity-70'
            }`}
          >
            {/* Active indicator strip */}
            <div
              className={`absolute top-0 left-0 h-1 w-full ${
                plan.isActive ? 'bg-emerald-500' : 'bg-gray-500'
              }`}
            />

            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge
                      variant={plan.isActive ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => openEditPlan(plan)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-red-500 hover:text-red-400"
                    onClick={() => confirmDeletePlan(plan.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Price */}
              <div className="flex items-baseline gap-1">
                <DollarSign className="size-4 text-emerald-500" />
                <span className="text-3xl font-bold">
                  {plan.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {plan.period.toLowerCase()}
                </span>
              </div>

              {/* Features */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm">
                  <Gauge className="size-4 text-emerald-500" />
                  <span>Speed: <span className="font-medium">{plan.speed}</span></span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <HardDrive className="size-4 text-emerald-500" />
                  <span>Data: <span className="font-medium">{plan.dataLimit}</span></span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <MonitorSmartphone className="size-4 text-emerald-500" />
                  <span>Devices: <span className="font-medium">{plan.maxDevices}</span></span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="size-4 text-emerald-500" />
                  <span>Period: <span className="font-medium">{plan.period}</span></span>
                </div>
              </div>

              {/* Subscriber count */}
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{plan.subscribers}</span>{' '}
                  subscriber{plan.subscribers !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="mx-auto mb-3 size-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No plans yet. Create one to get started.</p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update plan details' : 'Define a new subscription plan for users'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Name</Label>
              <Input
                id="plan-name"
                value={planForm.name}
                onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., CoreX Pro"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-speed">Speed</Label>
                <Input
                  id="plan-speed"
                  value={planForm.speed}
                  onChange={(e) => setPlanForm((f) => ({ ...f, speed: e.target.value }))}
                  placeholder="e.g., 50 Mbps"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-data">Data Limit</Label>
                <Input
                  id="plan-data"
                  value={planForm.dataLimit}
                  onChange={(e) => setPlanForm((f) => ({ ...f, dataLimit: e.target.value }))}
                  placeholder="e.g., 100 GB"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan-devices">Max Devices</Label>
                <Input
                  id="plan-devices"
                  type="number"
                  min={1}
                  value={planForm.maxDevices}
                  onChange={(e) =>
                    setPlanForm((f) => ({
                      ...f,
                      maxDevices: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-price">Price (৳)</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={planForm.price}
                  onChange={(e) =>
                    setPlanForm((f) => ({
                      ...f,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Period</Label>
              <Select
                value={planForm.period}
                onValueChange={(v) =>
                  setPlanForm((f) => ({ ...f, period: v as Plan['period'] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="plan-active">Active</Label>
              <Switch
                id="plan-active"
                checked={planForm.isActive}
                onCheckedChange={(checked) =>
                  setPlanForm((f) => ({ ...f, isActive: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePlan}>
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this subscription plan. Users currently on this plan will
              not be affected immediately, but new subscriptions will not be available. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePlan} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
