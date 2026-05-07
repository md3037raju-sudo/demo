'use client'

import { useState, useCallback } from 'react'
import { mockProxyPresets } from '@/lib/mock-data'
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
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Activity,
  ChevronDown,
  ChevronRight,
  Upload,
  ImagePlus,
  HeartPulse,
  Server,
  Users,
  Globe,
  ShieldCheck,
} from 'lucide-react'

// Types
interface Proxy {
  id: string
  address: string
  port: number
  protocol: string
  status: 'online' | 'offline' | 'unknown'
  latency: number | null
}

interface Subgroup {
  id: string
  name: string
  proxyCount: number
  status: 'healthy' | 'degraded' | 'down'
  image: string | null
  imageWidth: number
  imageHeight: number
  proxies: Proxy[]
}

interface Preset {
  id: string
  name: string
  description: string
  isActive: boolean
  subgroups: Subgroup[]
  assignedUsers: number
}

// Helper to generate mock proxies for a subgroup
function generateMockProxies(count: number, subgroupName: string): Proxy[] {
  const protocols = ['ss', 'vmess', 'vless', 'trojan', 'ssr']
  const statuses: Proxy['status'][] = ['online', 'online', 'online', 'offline', 'unknown']
  return Array.from({ length: count }, (_, i) => ({
    id: `proxy_${subgroupName}_${i}`,
    address: `${10 + Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    port: [8080, 443, 8443, 1080, 2053][Math.floor(Math.random() * 5)],
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    latency: Math.floor(Math.random() * 200) + 10,
  }))
}

// Convert mock data to internal state format
function initPresets(): Preset[] {
  return mockProxyPresets.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    isActive: p.isActive,
    assignedUsers: p.assignedUsers,
    subgroups: p.subgroups.map((sg) => ({
      id: sg.id,
      name: sg.name,
      proxyCount: sg.proxyCount,
      status: sg.status,
      image: sg.image,
      imageWidth: sg.imageWidth,
      imageHeight: sg.imageHeight,
      proxies: generateMockProxies(sg.proxyCount, sg.name),
    })),
  }))
}

// Status dot component
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500',
    online: 'bg-emerald-500',
    offline: 'bg-red-500',
    unknown: 'bg-gray-500',
    active: 'bg-emerald-500',
    inactive: 'bg-gray-500',
  }
  return (
    <span
      className={`inline-block size-2.5 rounded-full ${colors[status] ?? 'bg-gray-500'}`}
    />
  )
}

export function AdminProxiesPreset() {
  const [presets, setPresets] = useState<Preset[]>(initPresets)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [expandedSubgroups, setExpandedSubgroups] = useState<Set<string>>(new Set())

  // Dialog states
  const [presetDialogOpen, setPresetDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null)
  const [presetForm, setPresetForm] = useState({ name: '', description: '', isActive: true })

  const [subgroupDialogOpen, setSubgroupDialogOpen] = useState(false)
  const [subgroupForm, setSubgroupForm] = useState({
    name: '',
    imageWidth: 200,
    imageHeight: 100,
  })

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [bulkUploadTarget, setBulkUploadTarget] = useState<string | null>(null)
  const [bulkUploadData, setBulkUploadData] = useState('')
  const [bulkUploadTab, setBulkUploadTab] = useState('csv')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null)

  const [healthCheckRunning, setHealthCheckRunning] = useState(false)
  const [healthSummary, setHealthSummary] = useState<{
    healthy: number
    degraded: number
    down: number
  } | null>(null)

  const selectedPreset = presets.find((p) => p.id === selectedPresetId)

  // Toggle subgroup expansion
  const toggleSubgroup = useCallback((sgId: string) => {
    setExpandedSubgroups((prev) => {
      const next = new Set(prev)
      if (next.has(sgId)) next.delete(sgId)
      else next.add(sgId)
      return next
    })
  }, [])

  // Add/Edit preset
  const openAddPreset = () => {
    setEditingPreset(null)
    setPresetForm({ name: '', description: '', isActive: true })
    setPresetDialogOpen(true)
  }

  const openEditPreset = (preset: Preset) => {
    setEditingPreset(preset)
    setPresetForm({
      name: preset.name,
      description: preset.description,
      isActive: preset.isActive,
    })
    setPresetDialogOpen(true)
  }

  const savePreset = () => {
    if (!presetForm.name.trim()) {
      toast.error('Preset name is required')
      return
    }
    if (editingPreset) {
      setPresets((prev) =>
        prev.map((p) =>
          p.id === editingPreset.id
            ? { ...p, name: presetForm.name, description: presetForm.description, isActive: presetForm.isActive }
            : p
        )
      )
      toast.success('Preset updated successfully')
    } else {
      const newPreset: Preset = {
        id: `preset_${Date.now()}`,
        name: presetForm.name,
        description: presetForm.description,
        isActive: presetForm.isActive,
        subgroups: [],
        assignedUsers: 0,
      }
      setPresets((prev) => [...prev, newPreset])
      toast.success('Preset created successfully')
    }
    setPresetDialogOpen(false)
  }

  // Delete preset
  const confirmDeletePreset = (id: string) => {
    setDeletingPresetId(id)
    setDeleteDialogOpen(true)
  }

  const deletePreset = () => {
    setPresets((prev) => prev.filter((p) => p.id !== deletingPresetId))
    if (selectedPresetId === deletingPresetId) setSelectedPresetId(null)
    setDeleteDialogOpen(false)
    toast.success('Preset deleted')
  }

  // Add subgroup
  const openAddSubgroup = () => {
    setSubgroupForm({ name: '', imageWidth: 200, imageHeight: 100 })
    setSubgroupDialogOpen(true)
  }

  const saveSubgroup = () => {
    if (!selectedPresetId || !subgroupForm.name.trim()) {
      toast.error('Subgroup name is required')
      return
    }
    const newSg: Subgroup = {
      id: `sg_${Date.now()}`,
      name: subgroupForm.name,
      proxyCount: 0,
      status: 'healthy',
      image: null,
      imageWidth: subgroupForm.imageWidth,
      imageHeight: subgroupForm.imageHeight,
      proxies: [],
    }
    setPresets((prev) =>
      prev.map((p) =>
        p.id === selectedPresetId ? { ...p, subgroups: [...p.subgroups, newSg] } : p
      )
    )
    setSubgroupDialogOpen(false)
    toast.success('Subgroup added')
  }

  // Delete subgroup
  const deleteSubgroup = (sgId: string) => {
    if (!selectedPresetId) return
    setPresets((prev) =>
      prev.map((p) =>
        p.id === selectedPresetId
          ? { ...p, subgroups: p.subgroups.filter((sg) => sg.id !== sgId) }
          : p
      )
    )
    toast.success('Subgroup deleted')
  }

  // Bulk upload
  const openBulkUpload = (sgId: string) => {
    setBulkUploadTarget(sgId)
    setBulkUploadData('')
    setBulkUploadTab('csv')
    setBulkUploadOpen(true)
  }

  const processBulkUpload = () => {
    if (!selectedPresetId || !bulkUploadTarget || !bulkUploadData.trim()) {
      toast.error('No data to upload')
      return
    }

    let newProxies: Proxy[] = []

    try {
      if (bulkUploadTab === 'csv') {
        const lines = bulkUploadData.trim().split('\n')
        // Skip header if present
        const dataLines = lines[0]?.toLowerCase().includes('address') ? lines.slice(1) : lines
        newProxies = dataLines
          .filter((l) => l.trim())
          .map((line, i) => {
            const parts = line.split(',').map((s) => s.trim())
            return {
              id: `proxy_upload_${Date.now()}_${i}`,
              address: parts[0] || '0.0.0.0',
              port: parseInt(parts[1]) || 8080,
              protocol: parts[2] || 'ss',
              status: 'unknown' as const,
              latency: null,
            }
          })
      } else {
        const parsed = JSON.parse(bulkUploadData)
        const arr = Array.isArray(parsed) ? parsed : [parsed]
        newProxies = arr.map((item: Record<string, unknown>, i: number) => ({
          id: `proxy_upload_${Date.now()}_${i}`,
          address: (item.address as string) || '0.0.0.0',
          port: (item.port as number) || 8080,
          protocol: (item.protocol as string) || 'ss',
          status: 'unknown' as const,
          latency: null,
        }))
      }
    } catch {
      toast.error('Failed to parse proxy data. Check format.')
      return
    }

    if (newProxies.length === 0) {
      toast.error('No valid proxies found')
      return
    }

    setPresets((prev) =>
      prev.map((p) =>
        p.id === selectedPresetId
          ? {
              ...p,
              subgroups: p.subgroups.map((sg) =>
                sg.id === bulkUploadTarget
                  ? { ...sg, proxies: [...sg.proxies, ...newProxies], proxyCount: sg.proxies.length + newProxies.length }
                  : sg
              ),
            }
          : p
      )
    )
    setBulkUploadOpen(false)
    toast.success(`${newProxies.length} proxies added`)
  }

  // Delete proxy
  const deleteProxy = (sgId: string, proxyId: string) => {
    if (!selectedPresetId) return
    setPresets((prev) =>
      prev.map((p) =>
        p.id === selectedPresetId
          ? {
              ...p,
              subgroups: p.subgroups.map((sg) =>
                sg.id === sgId
                  ? { ...sg, proxies: sg.proxies.filter((px) => px.id !== proxyId), proxyCount: sg.proxies.length - 1 }
                  : sg
              ),
            }
          : p
      )
    )
    toast.success('Proxy removed')
  }

  // Health check single proxy
  const healthCheckProxy = (sgId: string, proxyId: string) => {
    if (!selectedPresetId) return
    const statuses: Proxy['status'][] = ['online', 'online', 'online', 'offline']
    setPresets((prev) =>
      prev.map((p) =>
        p.id === selectedPresetId
          ? {
              ...p,
              subgroups: p.subgroups.map((sg) =>
                sg.id === sgId
                  ? {
                      ...sg,
                      proxies: sg.proxies.map((px) =>
                        px.id === proxyId
                          ? {
                              ...px,
                              status: statuses[Math.floor(Math.random() * statuses.length)],
                              latency: Math.floor(Math.random() * 150) + 5,
                            }
                          : px
                      ),
                    }
                  : sg
              ),
            }
          : p
      )
    )
    toast.success('Proxy health checked')
  }

  // Health check subgroup
  const healthCheckSubgroup = (sgId: string) => {
    if (!selectedPresetId) return
    const proxyStatuses: Proxy['status'][] = ['online', 'online', 'online', 'offline', 'unknown']
    const subStatuses: Subgroup['status'][] = ['healthy', 'healthy', 'degraded', 'down']

    setPresets((prev) =>
      prev.map((p) =>
        p.id === selectedPresetId
          ? {
              ...p,
              subgroups: p.subgroups.map((sg) =>
                sg.id === sgId
                  ? {
                      ...sg,
                      status: subStatuses[Math.floor(Math.random() * subStatuses.length)],
                      proxies: sg.proxies.map((px) => ({
                        ...px,
                        status: proxyStatuses[Math.floor(Math.random() * proxyStatuses.length)],
                        latency: Math.floor(Math.random() * 200) + 10,
                      })),
                    }
                  : sg
              ),
            }
          : p
      )
    )
    toast.success('Subgroup health checked')
  }

  // Health check all
  const healthCheckAll = () => {
    setHealthCheckRunning(true)

    setTimeout(() => {
      const proxyStatuses: Proxy['status'][] = ['online', 'online', 'online', 'offline', 'unknown']
      const subStatuses: Subgroup['status'][] = ['healthy', 'healthy', 'degraded', 'down']

      let h = 0
      let d = 0
      let dn = 0

      setPresets((prev) =>
        prev.map((p) => ({
          ...p,
          subgroups: p.subgroups.map((sg) => {
            const newStatus = subStatuses[Math.floor(Math.random() * subStatuses.length)]
            if (newStatus === 'healthy') h++
            else if (newStatus === 'degraded') d++
            else dn++

            return {
              ...sg,
              status: newStatus,
              proxies: sg.proxies.map((px) => ({
                ...px,
                status: proxyStatuses[Math.floor(Math.random() * proxyStatuses.length)],
                latency: Math.floor(Math.random() * 200) + 10,
              })),
            }
          }),
        }))
      )

      setHealthSummary({ healthy: h, degraded: d, down: dn })
      setHealthCheckRunning(false)
      toast.success('Health check complete')
    }, 1500)
  }

  // Image upload mock
  const uploadSubgroupImage = (sgId: string) => {
    if (!selectedPresetId) return
    setPresets((prev) =>
      prev.map((p) =>
        p.id === selectedPresetId
          ? {
              ...p,
              subgroups: p.subgroups.map((sg) =>
                sg.id === sgId
                  ? {
                      ...sg,
                      image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${sg.imageWidth}' height='${sg.imageHeight}'%3E%3Crect width='100%25' height='100%25' fill='%2310b981'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E${encodeURIComponent(sg.name)}%3C/text%3E%3C/svg%3E`,
                    }
                  : sg
              ),
            }
          : p
      )
    )
    toast.success('Image uploaded (mock)')
  }

  // Update subgroup image dimensions
  const updateSubgroupImageSize = (sgId: string, width: number, height: number) => {
    if (!selectedPresetId) return
    setPresets((prev) =>
      prev.map((p) =>
        p.id === selectedPresetId
          ? {
              ...p,
              subgroups: p.subgroups.map((sg) =>
                sg.id === sgId ? { ...sg, imageWidth: width, imageHeight: height } : sg
              ),
            }
          : p
      )
    )
  }

  // ============ PRESET LIST VIEW ============
  if (!selectedPreset) {
    return (
      <div className="dark space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Proxy Presets</h1>
            <p className="text-muted-foreground text-sm">
              Manage proxy presets and load-balanced subgroups
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={openAddPreset} className="gap-2">
              <Plus className="size-4" />
              Add New Preset
            </Button>
            <Button
              variant="outline"
              onClick={healthCheckAll}
              disabled={healthCheckRunning}
              className="gap-2"
            >
              <HeartPulse className="size-4" />
              {healthCheckRunning ? 'Checking...' : 'Health Check All'}
            </Button>
          </div>
        </div>

        {/* Health Summary */}
        {healthSummary && (
          <div className="flex gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <StatusDot status="healthy" />
              <span className="text-sm">{healthSummary.healthy} Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="degraded" />
              <span className="text-sm">{healthSummary.degraded} Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status="down" />
              <span className="text-sm">{healthSummary.down} Down</span>
            </div>
          </div>
        )}

        {/* Preset Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => {
            const totalProxies = preset.subgroups.reduce((sum, sg) => sum + sg.proxyCount, 0)
            return (
              <Card
                key={preset.id}
                className="cursor-pointer transition-colors hover:border-emerald-500/50"
                onClick={() => setSelectedPresetId(preset.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="size-5 text-emerald-500" />
                      <CardTitle className="text-base">{preset.name}</CardTitle>
                    </div>
                    <Badge variant={preset.isActive ? 'default' : 'secondary'}>
                      <StatusDot status={preset.isActive ? 'active' : 'inactive'} />
                      <span className="ml-1.5">{preset.isActive ? 'Active' : 'Inactive'}</span>
                    </Badge>
                  </div>
                  <CardDescription>{preset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="text-lg font-semibold text-emerald-500">
                        {preset.subgroups.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Subgroups</div>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="text-lg font-semibold text-emerald-500">{totalProxies}</div>
                      <div className="text-xs text-muted-foreground">Proxies</div>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="text-lg font-semibold text-emerald-500">
                        {preset.assignedUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">Users</div>
                    </div>
                  </div>
                  {/* Subgroup status indicators */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {preset.subgroups.map((sg) => (
                      <span
                        key={sg.id}
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                      >
                        <StatusDot status={sg.status} />
                        {sg.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Add/Edit Preset Dialog */}
        <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPreset ? 'Edit Preset' : 'Add New Preset'}</DialogTitle>
              <DialogDescription>
                {editingPreset
                  ? 'Update preset details'
                  : 'Create a new proxy preset with subgroups'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">Name</Label>
                <Input
                  id="preset-name"
                  value={presetForm.name}
                  onChange={(e) => setPresetForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Bangladesh Premium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preset-desc">Description</Label>
                <Textarea
                  id="preset-desc"
                  value={presetForm.description}
                  onChange={(e) => setPresetForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this preset"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="preset-active">Active</Label>
                <Switch
                  id="preset-active"
                  checked={presetForm.isActive}
                  onCheckedChange={(checked) => setPresetForm((f) => ({ ...f, isActive: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPresetDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={savePreset}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Preset Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Preset</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this preset and all its subgroups and proxies. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deletePreset}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  // ============ PRESET DETAIL VIEW ============
  return (
    <div className="dark space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedPresetId(null)}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{selectedPreset.name}</h1>
            <p className="text-sm text-muted-foreground">{selectedPreset.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => openEditPreset(selectedPreset)}
            className="gap-2"
          >
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => confirmDeletePreset(selectedPreset.id)}
            className="gap-2"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Preset Overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Server className="size-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {selectedPreset.subgroups.reduce((s, sg) => s + sg.proxyCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Proxies</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Globe className="size-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{selectedPreset.subgroups.length}</div>
              <div className="text-xs text-muted-foreground">Subgroups</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Users className="size-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{selectedPreset.assignedUsers}</div>
              <div className="text-xs text-muted-foreground">Assigned Users</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <ShieldCheck className="size-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {selectedPreset.subgroups.filter((sg) => sg.status === 'healthy').length}/
                {selectedPreset.subgroups.length}
              </div>
              <div className="text-xs text-muted-foreground">Healthy Subgroups</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subgroups Header */}
      <Separator />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Subgroups</h2>
        <div className="flex gap-2">
          <Button onClick={openAddSubgroup} className="gap-2">
            <Plus className="size-4" />
            Add Subgroup
          </Button>
          <Button
            variant="outline"
            onClick={healthCheckAll}
            disabled={healthCheckRunning}
            className="gap-2"
          >
            <Activity className="size-4" />
            {healthCheckRunning ? 'Checking...' : 'Health Check All'}
          </Button>
        </div>
      </div>

      {/* Health Summary (detail view) */}
      {healthSummary && (
        <div className="flex gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <StatusDot status="healthy" />
            <span className="text-sm">{healthSummary.healthy} Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status="degraded" />
            <span className="text-sm">{healthSummary.degraded} Degraded</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot status="down" />
            <span className="text-sm">{healthSummary.down} Down</span>
          </div>
        </div>
      )}

      {/* Subgroups List */}
      <div className="space-y-4">
        {selectedPreset.subgroups.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Globe className="mx-auto mb-3 size-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No subgroups yet. Add one to get started.</p>
            </CardContent>
          </Card>
        )}

        {selectedPreset.subgroups.map((sg) => {
          const isExpanded = expandedSubgroups.has(sg.id)
          return (
            <Card key={sg.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleSubgroup(sg.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{sg.name}</CardTitle>
                        <StatusDot status={sg.status} />
                        <Badge variant="outline" className="text-xs">
                          {sg.status}
                        </Badge>
                      </div>
                      <CardDescription>{sg.proxyCount} proxies</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => healthCheckSubgroup(sg.id)}
                      className="gap-1.5"
                    >
                      <HeartPulse className="size-3.5" />
                      Check
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openBulkUpload(sg.id)}
                      className="gap-1.5"
                    >
                      <Upload className="size-3.5" />
                      Bulk Upload
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSubgroup(sg.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  {/* Image preview + size editor */}
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div
                      className="relative flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30"
                      style={{ width: sg.imageWidth, height: sg.imageHeight }}
                    >
                      {sg.image ? (
                        <img
                          src={sg.image}
                          alt={sg.name}
                          className="h-full w-full object-cover"
                          style={{ maxWidth: sg.imageWidth, maxHeight: sg.imageHeight }}
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
                          <ImagePlus className="size-6" />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-1 bottom-1 h-6 gap-1 px-2 text-xs"
                        onClick={() => uploadSubgroupImage(sg.id)}
                      >
                        <ImagePlus className="size-3" />
                        Upload
                      </Button>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Width</Label>
                        <Input
                          type="number"
                          value={sg.imageWidth}
                          onChange={(e) =>
                            updateSubgroupImageSize(
                              sg.id,
                              parseInt(e.target.value) || 200,
                              sg.imageHeight
                            )
                          }
                          className="w-20"
                        />
                      </div>
                      <span className="text-muted-foreground">×</span>
                      <div className="space-y-1">
                        <Label className="text-xs">Height</Label>
                        <Input
                          type="number"
                          value={sg.imageHeight}
                          onChange={(e) =>
                            updateSubgroupImageSize(
                              sg.id,
                              sg.imageWidth,
                              parseInt(e.target.value) || 100
                            )
                          }
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Proxy Table */}
                  {sg.proxies.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No proxies in this subgroup. Use Bulk Upload to add proxies.
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Address</TableHead>
                            <TableHead>Port</TableHead>
                            <TableHead>Protocol</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Latency</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sg.proxies.map((proxy) => (
                            <TableRow key={proxy.id}>
                              <TableCell className="font-mono text-sm">
                                {proxy.address}
                              </TableCell>
                              <TableCell>{proxy.port}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {proxy.protocol}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1.5 text-sm">
                                  <StatusDot status={proxy.status} />
                                  {proxy.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                {proxy.latency !== null ? `${proxy.latency}ms` : '—'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => healthCheckProxy(sg.id, proxy.id)}
                                    className="size-8 p-0"
                                  >
                                    <HeartPulse className="size-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteProxy(sg.id, proxy.id)}
                                    className="size-8 p-0 text-red-500 hover:text-red-400"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Add/Edit Preset Dialog (detail view) */}
      <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPreset ? 'Edit Preset' : 'Add New Preset'}</DialogTitle>
            <DialogDescription>
              {editingPreset ? 'Update preset details' : 'Create a new proxy preset'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name-d">Name</Label>
              <Input
                id="preset-name-d"
                value={presetForm.name}
                onChange={(e) => setPresetForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Bangladesh Premium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preset-desc-d">Description</Label>
              <Textarea
                id="preset-desc-d"
                value={presetForm.description}
                onChange={(e) => setPresetForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="preset-active-d">Active</Label>
              <Switch
                id="preset-active-d"
                checked={presetForm.isActive}
                onCheckedChange={(checked) => setPresetForm((f) => ({ ...f, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPresetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePreset}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Preset Dialog (detail view) */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this preset and all its subgroups and proxies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deletePreset} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Subgroup Dialog */}
      <Dialog open={subgroupDialogOpen} onOpenChange={setSubgroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subgroup</DialogTitle>
            <DialogDescription>
              Add a new load-balanced subgroup to this preset
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sg-name">Name</Label>
              <Input
                id="sg-name"
                value={subgroupForm.name}
                onChange={(e) => setSubgroupForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Dhaka"
              />
            </div>
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ImagePlus className="size-3.5" />
                  Choose File
                </Button>
                <span className="text-xs text-muted-foreground">SVG or PNG</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-2">
                <Label htmlFor="sg-img-w">Image Width</Label>
                <Input
                  id="sg-img-w"
                  type="number"
                  value={subgroupForm.imageWidth}
                  onChange={(e) =>
                    setSubgroupForm((f) => ({
                      ...f,
                      imageWidth: parseInt(e.target.value) || 200,
                    }))
                  }
                  className="w-24"
                />
              </div>
              <span className="text-muted-foreground">×</span>
              <div className="space-y-2">
                <Label htmlFor="sg-img-h">Image Height</Label>
                <Input
                  id="sg-img-h"
                  type="number"
                  value={subgroupForm.imageHeight}
                  onChange={(e) =>
                    setSubgroupForm((f) => ({
                      ...f,
                      imageHeight: parseInt(e.target.value) || 100,
                    }))
                  }
                  className="w-24"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubgroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSubgroup}>Add Subgroup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Upload Proxies</DialogTitle>
            <DialogDescription>
              Paste proxy data in CSV or JSON format to add multiple proxies at once
            </DialogDescription>
          </DialogHeader>
          <Tabs value={bulkUploadTab} onValueChange={setBulkUploadTab}>
            <TabsList className="w-full">
              <TabsTrigger value="csv" className="flex-1">
                CSV
              </TabsTrigger>
              <TabsTrigger value="json" className="flex-1">
                JSON
              </TabsTrigger>
            </TabsList>
            <TabsContent value="csv" className="space-y-3">
              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">CSV Format:</p>
                <code className="block whitespace-pre text-emerald-400">
                  address,port,protocol{'\n'}1.2.3.4,8080,ss{'\n'}5.6.7.8,443,vmess
                </code>
              </div>
              <Textarea
                value={bulkUploadTab === 'csv' ? bulkUploadData : ''}
                onChange={(e) => setBulkUploadData(e.target.value)}
                placeholder="Paste CSV data here..."
                rows={6}
                className="font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="json" className="space-y-3">
              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">JSON Format:</p>
                <code className="block whitespace-pre text-emerald-400">
                  {'[{"address":"1.2.3.4","port":8080,"protocol":"ss"}]'}
                </code>
              </div>
              <Textarea
                value={bulkUploadTab === 'json' ? bulkUploadData : ''}
                onChange={(e) => setBulkUploadData(e.target.value)}
                placeholder="Paste JSON data here..."
                rows={6}
                className="font-mono text-sm"
              />
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processBulkUpload} className="gap-2">
              <Upload className="size-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
