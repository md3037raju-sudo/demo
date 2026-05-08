'use client'

import { useState, useCallback, useMemo } from 'react'
import { mockProxyPresets, mockProxies, type ProxyEntry, type ProxyProtocol } from '@/lib/mock-data'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Copy,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────

interface Subgroup {
  id: string
  name: string
  proxyCount: number
  status: 'healthy' | 'degraded' | 'down'
  image: string | null
  imageWidth: number
  imageHeight: number
  proxies: ProxyEntry[]
}

interface Preset {
  id: string
  name: string
  description: string
  isActive: boolean
  subgroups: Subgroup[]
  assignedUsers: number
}

// ─── Constants ───────────────────────────────────────────────────────

const PROTOCOLS: { value: ProxyProtocol; label: string }[] = [
  { value: 'vless', label: 'VLESS' },
  { value: 'vmess', label: 'VMess' },
  { value: 'trojan', label: 'Trojan' },
  { value: 'ss', label: 'Shadowsocks' },
  { value: 'ssr', label: 'ShadowsocksR' },
  { value: 'wireguard', label: 'WireGuard' },
  { value: 'socks5', label: 'Socks5' },
  { value: 'http', label: 'HTTP' },
]

const PROTOCOL_COLORS: Record<ProxyProtocol, string> = {
  vless: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
  vmess: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  trojan: 'bg-red-500/15 text-red-600 border-red-500/30',
  ss: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  ssr: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  wireguard: 'bg-teal-500/15 text-teal-600 border-teal-500/30',
  socks5: 'bg-gray-500/15 text-gray-600 border-gray-500/30',
  http: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
}

const NETWORK_OPTIONS = ['tcp', 'ws', 'grpc', 'h2']
const FLOW_OPTIONS = ['', 'xtls-rprx-vision', 'xtls-rprx-vision-udp443']
const VMESS_CIPHER_OPTIONS = ['auto', 'aes-128-gcm', 'chacha20-poly1305', 'none']
const SS_CIPHER_OPTIONS = [
  'aes-128-gcm', 'aes-192-gcm', 'aes-256-gcm',
  'chacha20-ietf-poly1305', 'xchacha20-ietf-poly1305',
  '2022-blake3-aes-128-gcm', '2022-blake3-aes-256-gcm',
]
const SSR_CIPHER_OPTIONS = ['aes-128-cfb', 'aes-192-cfb', 'aes-256-cfb', 'chacha20-ietf', 'rc4-md5']
const SSR_PROTOCOL_OPTIONS = ['origin', 'auth_sha1_v4', 'auth_aes128_md5', 'auth_aes128_sha1']
const SSR_OBFS_OPTIONS = ['plain', 'http_simple', 'tls1.2_ticket_auth']
const CLIENT_FINGERPRINT_OPTIONS = ['chrome', 'firefox', 'safari', 'ios', 'android', 'edge']
const SS_PLUGIN_OPTIONS = ['', 'obfs', 'v2ray-plugin']

// ─── Default proxy form per protocol ─────────────────────────────────

function getDefaultProxyForm(protocol: ProxyProtocol): Partial<ProxyEntry> {
  const base = {
    protocol,
    address: '',
    port: 443,
    status: 'unknown' as const,
    latency: null,
  }

  switch (protocol) {
    case 'vless':
      return { ...base, uuid: '', network: 'tcp', tls: false, flow: '', clientFingerprint: '' }
    case 'vmess':
      return { ...base, uuid: '', network: 'tcp', tls: false, cipher: 'auto', alterId: 0, skipCertVerify: false }
    case 'trojan':
      return { ...base, password: '', network: 'tcp', tls: true, skipCertVerify: false }
    case 'ss':
      return { ...base, password: '', cipher: 'aes-256-gcm', udp: false, plugin: '' }
    case 'ssr':
      return { ...base, password: '', cipher: 'aes-256-cfb', ssrProtocol: 'origin', obfs: 'plain', obfsParam: '' }
    case 'wireguard':
      return { ...base, port: 51820, privateKey: '', publicKey: '', presharedKey: '', dns: '', mtu: 1280 }
    case 'socks5':
      return { ...base, port: 1080, username: '', password: '', tls: false, skipCertVerify: false }
    case 'http':
      return { ...base, port: 8080, username: '', password: '', tls: false, skipCertVerify: false }
  }
}

// ─── Init presets from mock data ─────────────────────────────────────

function initPresets(): Preset[] {
  return mockProxyPresets.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    isActive: p.isActive,
    assignedUsers: p.assignedUsers,
    subgroups: p.subgroups.map((sg) => {
      const sgProxyIds = (sg as { proxyIds?: string[] }).proxyIds ?? []
      const proxies = sgProxyIds
        .map((pid) => mockProxies.find((mp) => mp.id === pid))
        .filter((p): p is ProxyEntry => !!p)
      return {
        id: sg.id,
        name: sg.name,
        proxyCount: sg.proxyCount,
        status: sg.status,
        image: sg.image,
        imageWidth: sg.imageWidth,
        imageHeight: sg.imageHeight,
        proxies,
      }
    }),
  }))
}

// ─── Status Dot ──────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    down: 'bg-red-500',
    online: 'bg-emerald-500',
    offline: 'bg-red-500',
    unknown: 'bg-gray-500',
    degraded_status: 'bg-amber-500',
    active: 'bg-emerald-500',
    inactive: 'bg-gray-500',
  }
  return (
    <span
      className={`inline-block size-2.5 rounded-full ${colors[status] ?? 'bg-gray-500'}`}
    />
  )
}

// ─── Protocol Badge ──────────────────────────────────────────────────

function ProtocolBadge({ protocol }: { protocol: ProxyProtocol }) {
  const label = PROTOCOLS.find((p) => p.value === protocol)?.label ?? protocol.toUpperCase()
  return (
    <Badge variant="outline" className={`text-xs font-semibold ${PROTOCOL_COLORS[protocol] ?? ''}`}>
      {label}
    </Badge>
  )
}

// ─── Main Component ──────────────────────────────────────────────────

export function AdminProxiesPreset() {
  const [presets, setPresets] = useState<Preset[]>(initPresets)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [expandedSubgroups, setExpandedSubgroups] = useState<Set<string>>(new Set())

  // Preset dialog
  const [presetDialogOpen, setPresetDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null)
  const [presetForm, setPresetForm] = useState({ name: '', description: '', isActive: true })

  // Subgroup dialog
  const [subgroupDialogOpen, setSubgroupDialogOpen] = useState(false)
  const [subgroupForm, setSubgroupForm] = useState({ name: '', imageWidth: 200, imageHeight: 100 })

  // Proxy dialog
  const [proxyDialogOpen, setProxyDialogOpen] = useState(false)
  const [editingProxy, setEditingProxy] = useState<ProxyEntry | null>(null)
  const [proxyTargetSgId, setProxyTargetSgId] = useState<string | null>(null)
  const [proxyForm, setProxyForm] = useState<Partial<ProxyEntry>>(getDefaultProxyForm('vless'))

  // Bulk upload dialog
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)
  const [bulkUploadTarget, setBulkUploadTarget] = useState<string | null>(null)
  const [bulkUploadData, setBulkUploadData] = useState('')
  const [bulkUploadTab, setBulkUploadTab] = useState('csv')

  // Delete dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null)

  // Health check
  const [healthCheckRunning, setHealthCheckRunning] = useState(false)
  const [healthSummary, setHealthSummary] = useState<{ healthy: number; degraded: number; down: number } | null>(null)

  const selectedPreset = presets.find((p) => p.id === selectedPresetId)

  // ─── Callbacks ──────────────────────────────────────────────────

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
    setPresetForm({ name: preset.name, description: preset.description, isActive: preset.isActive })
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

  // ─── Proxy Add/Edit ────────────────────────────────────────────

  const openAddProxy = (sgId: string) => {
    setEditingProxy(null)
    setProxyTargetSgId(sgId)
    setProxyForm(getDefaultProxyForm('vless'))
    setProxyDialogOpen(true)
  }

  const openEditProxy = (sgId: string, proxy: ProxyEntry) => {
    setEditingProxy(proxy)
    setProxyTargetSgId(sgId)
    setProxyForm({ ...proxy })
    setProxyDialogOpen(true)
  }

  const handleProtocolChange = (protocol: ProxyProtocol) => {
    setProxyForm((prev) => {
      const defaults = getDefaultProxyForm(protocol)
      return {
        ...defaults,
        // preserve common fields if already filled
        address: prev.address || defaults.address || '',
        port: prev.port || defaults.port || 443,
      }
    })
  }

  const saveProxy = () => {
    if (!selectedPresetId || !proxyTargetSgId) return
    if (!proxyForm.address?.trim()) {
      toast.error('Address is required')
      return
    }
    if (!proxyForm.port) {
      toast.error('Port is required')
      return
    }

    if (editingProxy) {
      // Edit existing
      const updated = { ...editingProxy, ...proxyForm } as ProxyEntry
      setPresets((prev) =>
        prev.map((p) =>
          p.id === selectedPresetId
            ? {
                ...p,
                subgroups: p.subgroups.map((sg) =>
                  sg.id === proxyTargetSgId
                    ? { ...sg, proxies: sg.proxies.map((px) => (px.id === editingProxy.id ? updated : px)) }
                    : sg
                ),
              }
            : p
        )
      )
      toast.success('Proxy updated')
    } else {
      // Add new
      const newProxy: ProxyEntry = {
        id: `px_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        protocol: proxyForm.protocol ?? 'vless',
        address: proxyForm.address ?? '',
        port: proxyForm.port ?? 443,
        uuid: proxyForm.uuid,
        password: proxyForm.password,
        username: proxyForm.username,
        flow: proxyForm.flow,
        network: proxyForm.network,
        tls: proxyForm.tls,
        sni: proxyForm.sni,
        alpn: proxyForm.alpn,
        cipher: proxyForm.cipher,
        alterId: proxyForm.alterId,
        skipCertVerify: proxyForm.skipCertVerify,
        realityPublicKey: proxyForm.realityPublicKey,
        realityShortId: proxyForm.realityShortId,
        clientFingerprint: proxyForm.clientFingerprint,
        grpcService: proxyForm.grpcService,
        wsPath: proxyForm.wsPath,
        wsHost: proxyForm.wsHost,
        udp: proxyForm.udp,
        plugin: proxyForm.plugin,
        pluginOptsMode: proxyForm.pluginOptsMode,
        pluginOptsHost: proxyForm.pluginOptsHost,
        ssrProtocol: proxyForm.ssrProtocol,
        obfs: proxyForm.obfs,
        obfsParam: proxyForm.obfsParam,
        privateKey: proxyForm.privateKey,
        publicKey: proxyForm.publicKey,
        presharedKey: proxyForm.presharedKey,
        dns: proxyForm.dns,
        mtu: proxyForm.mtu,
        status: proxyForm.status ?? 'unknown',
        latency: proxyForm.latency ?? null,
      }
      setPresets((prev) =>
        prev.map((p) =>
          p.id === selectedPresetId
            ? {
                ...p,
                subgroups: p.subgroups.map((sg) =>
                  sg.id === proxyTargetSgId
                    ? { ...sg, proxies: [...sg.proxies, newProxy], proxyCount: sg.proxies.length + 1 }
                    : sg
                ),
              }
            : p
        )
      )
      toast.success('Proxy added')
    }
    setProxyDialogOpen(false)
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

  // ─── Bulk Upload ───────────────────────────────────────────────

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

    let newProxies: ProxyEntry[] = []

    try {
      if (bulkUploadTab === 'csv') {
        const lines = bulkUploadData.trim().split('\n')
        const dataLines = lines[0]?.toLowerCase().includes('protocol') ? lines.slice(1) : lines
        newProxies = dataLines
          .filter((l) => l.trim())
          .map((line, i) => {
            const parts = line.split(',').map((s) => s.trim())
            const protocol = (parts[0] || 'ss') as ProxyProtocol
            return {
              id: `px_upload_${Date.now()}_${i}`,
              protocol,
              address: parts[1] || '0.0.0.0',
              port: parseInt(parts[2]) || 443,
              uuid: ['vless', 'vmess'].includes(protocol) ? (parts[3] || '') : undefined,
              password: ['trojan', 'ss', 'ssr'].includes(protocol) ? (parts[3] || '') : undefined,
              username: ['socks5', 'http'].includes(protocol) ? (parts[3] || '') : undefined,
              status: 'unknown' as const,
              latency: null,
            }
          })
      } else {
        const parsed = JSON.parse(bulkUploadData)
        const arr = Array.isArray(parsed) ? parsed : [parsed]
        newProxies = arr.map((item: Record<string, unknown>, i: number) => ({
          id: `px_upload_${Date.now()}_${i}`,
          protocol: (item.protocol as ProxyProtocol) || 'ss',
          address: (item.address as string) || '0.0.0.0',
          port: (item.port as number) || 443,
          uuid: (item.uuid as string) || undefined,
          password: (item.password as string) || undefined,
          username: (item.username as string) || undefined,
          network: (item.network as string) || undefined,
          tls: (item.tls as boolean) || undefined,
          sni: (item.sni as string) || undefined,
          cipher: (item.cipher as string) || undefined,
          flow: (item.flow as string) || undefined,
          wsPath: (item.wsPath as string) || (item['ws-opts'] as Record<string, string>)?.path || undefined,
          wsHost: (item.wsHost as string) || (item['ws-opts'] as Record<string, string>)?.host || undefined,
          grpcService: (item.grpcService as string) || (item['grpc-opts'] as Record<string, string>)?.serviceName || undefined,
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

  // ─── Health Check ──────────────────────────────────────────────

  const healthCheckProxy = (sgId: string, proxyId: string) => {
    if (!selectedPresetId) return
    const statuses: ProxyEntry['status'][] = ['online', 'online', 'online', 'offline']
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
                          ? { ...px, status: statuses[Math.floor(Math.random() * statuses.length)], latency: Math.floor(Math.random() * 150) + 5 }
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

  const healthCheckSubgroup = (sgId: string) => {
    if (!selectedPresetId) return
    const proxyStatuses: ProxyEntry['status'][] = ['online', 'online', 'online', 'offline', 'unknown']
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

  const healthCheckAll = () => {
    setHealthCheckRunning(true)
    setTimeout(() => {
      const proxyStatuses: ProxyEntry['status'][] = ['online', 'online', 'online', 'offline', 'unknown']
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

  const updateSubgroupImageSize = (sgId: string, width: number, height: number) => {
    if (!selectedPresetId) return
    setPresets((prev) =>
      prev.map((p) =>
        p.id === selectedPresetId
          ? { ...p, subgroups: p.subgroups.map((sg) => (sg.id === sgId ? { ...sg, imageWidth: width, imageHeight: height } : sg)) }
          : p
      )
    )
  }

  // ─── Bulk Upload Examples ──────────────────────────────────────

  const csvExamples = useMemo(() => ({
    vless: `protocol,address,port,uuid,network,tls,sni,wsPath,wsHost,flow,realityPublicKey,realityShortId,clientFingerprint,grpcService
vless,node1.example.com,443,your-uuid-here,ws,true,example.com,/ws,example.com,,,,
vless,node2.example.com,443,your-uuid-here,tcp,true,example.com,,,,abc123pub,abcd1234,chrome,`,
    vmess: `protocol,address,port,uuid,network,tls,cipher,alterId,sni,wsPath,wsHost,grpcService,skipCertVerify
vmess,node1.example.com,443,your-uuid-here,ws,true,auto,0,example.com,/ws,example.com,,false
vmess,node2.example.com,8080,your-uuid-here,grpc,true,auto,0,example.com,,,,grpc-service,false`,
    trojan: `protocol,address,port,password,network,tls,sni,wsPath,wsHost,grpcService,skipCertVerify
trojan,node1.example.com,443,your-password,tcp,true,example.com,,,,false
trojan,node2.example.com,443,your-password,ws,true,example.com,/ws,example.com,,false`,
    ss: `protocol,address,port,password,cipher,udp,plugin,pluginOptsMode,pluginOptsHost
ss,node1.example.com,8388,your-password,aes-256-gcm,false,,,
ss,node2.example.com,8388,your-password,chacha20-ietf-poly1305,true,obfs,http_simple,example.com`,
    ssr: `protocol,address,port,password,cipher,protocol,obfs,obfsParam
ssr,node1.example.com,9100,your-password,aes-256-cfb,auth_aes128_sha1,tls1.2_ticket_auth,example.com`,
    wireguard: `protocol,address,port,privateKey,publicKey,presharedKey,dns,mtu
wireguard,wg1.example.com,51820,your-private-key,your-public-key,,1.1.1.1,1280`,
    socks5: `protocol,address,port,username,password,tls,skipCertVerify
socks5,proxy.example.com,1080,user,pass,false,false`,
    http: `protocol,address,port,username,password,tls,skipCertVerify
http,proxy.example.com,8080,user,pass,false,false`,
  }), [])

  const jsonExamples = useMemo(() => ({
    vless: `[
  {
    "protocol": "vless",
    "address": "node1.example.com",
    "port": 443,
    "uuid": "your-uuid-here",
    "network": "ws",
    "tls": true,
    "sni": "example.com",
    "wsPath": "/ws",
    "wsHost": "example.com"
  }
]`,
    vmess: `[
  {
    "protocol": "vmess",
    "address": "node1.example.com",
    "port": 443,
    "uuid": "your-uuid-here",
    "network": "grpc",
    "tls": true,
    "cipher": "auto",
    "grpcService": "grpc-service"
  }
]`,
    trojan: `[
  {
    "protocol": "trojan",
    "address": "node1.example.com",
    "port": 443,
    "password": "your-password",
    "network": "tcp",
    "tls": true,
    "sni": "example.com"
  }
]`,
    ss: `[
  {
    "protocol": "ss",
    "address": "node1.example.com",
    "port": 8388,
    "password": "your-password",
    "cipher": "aes-256-gcm"
  }
]`,
    ssr: `[
  {
    "protocol": "ssr",
    "address": "node1.example.com",
    "port": 9100,
    "password": "your-password",
    "cipher": "aes-256-cfb",
    "ssrProtocol": "auth_aes128_sha1",
    "obfs": "tls1.2_ticket_auth"
  }
]`,
    wireguard: `[
  {
    "protocol": "wireguard",
    "address": "wg1.example.com",
    "port": 51820,
    "privateKey": "your-private-key",
    "publicKey": "your-public-key",
    "dns": "1.1.1.1",
    "mtu": 1280
  }
]`,
    socks5: `[
  {
    "protocol": "socks5",
    "address": "proxy.example.com",
    "port": 1080,
    "username": "user",
    "password": "pass"
  }
]`,
    http: `[
  {
    "protocol": "http",
    "address": "proxy.example.com",
    "port": 8080,
    "username": "user",
    "password": "pass"
  }
]`,
  }), [])

  // ─── Proxy Form Fields ─────────────────────────────────────────

  const renderProxyFormFields = () => {
    const protocol = proxyForm.protocol ?? 'vless'

    // Auth field based on protocol
    const renderAuthField = () => {
      if (['vless', 'vmess'].includes(protocol)) {
        return (
          <div className="space-y-2">
            <Label>UUID</Label>
            <Input
              value={proxyForm.uuid ?? ''}
              onChange={(e) => setProxyForm((f) => ({ ...f, uuid: e.target.value }))}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
          </div>
        )
      }
      if (['trojan', 'ss', 'ssr'].includes(protocol)) {
        return (
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              value={proxyForm.password ?? ''}
              onChange={(e) => setProxyForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Password"
              type="password"
            />
          </div>
        )
      }
      if (['wireguard'].includes(protocol)) {
        return (
          <div className="space-y-2">
            <Label>Private Key</Label>
            <Input
              value={proxyForm.privateKey ?? ''}
              onChange={(e) => setProxyForm((f) => ({ ...f, privateKey: e.target.value }))}
              placeholder="Private key"
              type="password"
            />
          </div>
        )
      }
      if (['socks5', 'http'].includes(protocol)) {
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Username (optional)</Label>
              <Input
                value={proxyForm.username ?? ''}
                onChange={(e) => setProxyForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="Username"
              />
            </div>
            <div className="space-y-2">
              <Label>Password (optional)</Label>
              <Input
                value={proxyForm.password ?? ''}
                onChange={(e) => setProxyForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Password"
                type="password"
              />
            </div>
          </div>
        )
      }
      return null
    }

    // Network selector (for protocols that support it)
    const renderNetworkField = () => {
      if (!['vless', 'vmess', 'trojan'].includes(protocol)) return null
      return (
        <div className="space-y-2">
          <Label>Network</Label>
          <Select
            value={proxyForm.network ?? 'tcp'}
            onValueChange={(v) => setProxyForm((f) => ({ ...f, network: v }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {NETWORK_OPTIONS.map((n) => (
                <SelectItem key={n} value={n}>{n.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }

    // TLS toggle
    const renderTlsField = () => {
      if (!['vless', 'vmess', 'trojan', 'socks5', 'http'].includes(protocol)) return null
      return (
        <div className="flex items-center justify-between">
          <Label>TLS</Label>
          <Switch
            checked={proxyForm.tls ?? false}
            onCheckedChange={(checked) => setProxyForm((f) => ({ ...f, tls: checked }))}
          />
        </div>
      )
    }

    // SNI
    const renderSniField = () => {
      if (!['vless', 'vmess', 'trojan'].includes(protocol)) return null
      return (
        <div className="space-y-2">
          <Label>SNI / Server Name</Label>
          <Input
            value={proxyForm.sni ?? ''}
            onChange={(e) => setProxyForm((f) => ({ ...f, sni: e.target.value }))}
            placeholder="example.com"
          />
        </div>
      )
    }

    // Skip cert verify
    const renderSkipCertVerify = () => {
      if (!['vmess', 'trojan', 'socks5', 'http'].includes(protocol)) return null
      return (
        <div className="flex items-center justify-between">
          <Label>Skip Cert Verify</Label>
          <Switch
            checked={proxyForm.skipCertVerify ?? false}
            onCheckedChange={(checked) => setProxyForm((f) => ({ ...f, skipCertVerify: checked }))}
          />
        </div>
      )
    }

    // VLESS: Flow
    const renderVlessFields = () => {
      if (protocol !== 'vless') return null
      return (
        <>
          <div className="space-y-2">
            <Label>Flow</Label>
            <Select
              value={proxyForm.flow ?? ''}
              onValueChange={(v) => setProxyForm((f) => ({ ...f, flow: v }))}
            >
              <SelectTrigger><SelectValue placeholder="Select flow" /></SelectTrigger>
              <SelectContent>
                {FLOW_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f || 'none'}>{f || 'None'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Client Fingerprint</Label>
            <Select
              value={proxyForm.clientFingerprint ?? ''}
              onValueChange={(v) => setProxyForm((f) => ({ ...f, clientFingerprint: v }))}
            >
              <SelectTrigger><SelectValue placeholder="Select fingerprint" /></SelectTrigger>
              <SelectContent>
                {CLIENT_FINGERPRINT_OPTIONS.map((fp) => (
                  <SelectItem key={fp} value={fp}>{fp.charAt(0).toUpperCase() + fp.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )
    }

    // VLESS Reality fields
    const renderRealityFields = () => {
      if (protocol !== 'vless') return null
      return (
        <div className="space-y-3 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
          <div className="text-sm font-medium text-purple-600">Reality Options</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Public Key</Label>
              <Input
                value={proxyForm.realityPublicKey ?? ''}
                onChange={(e) => setProxyForm((f) => ({ ...f, realityPublicKey: e.target.value }))}
                placeholder="Reality public key"
              />
            </div>
            <div className="space-y-2">
              <Label>Short ID</Label>
              <Input
                value={proxyForm.realityShortId ?? ''}
                onChange={(e) => setProxyForm((f) => ({ ...f, realityShortId: e.target.value }))}
                placeholder="Short ID"
              />
            </div>
          </div>
        </div>
      )
    }

    // VMess specific
    const renderVmessFields = () => {
      if (protocol !== 'vmess') return null
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Cipher</Label>
            <Select
              value={proxyForm.cipher ?? 'auto'}
              onValueChange={(v) => setProxyForm((f) => ({ ...f, cipher: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VMESS_CIPHER_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Alter ID</Label>
            <Input
              type="number"
              value={proxyForm.alterId ?? 0}
              onChange={(e) => setProxyForm((f) => ({ ...f, alterId: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>
        </div>
      )
    }

    // gRPC opts (conditional on network=grpc)
    const renderGrpcFields = () => {
      if (proxyForm.network !== 'grpc') return null
      if (!['vless', 'vmess', 'trojan'].includes(protocol)) return null
      return (
        <div className="space-y-2">
          <Label>gRPC Service Name</Label>
          <Input
            value={proxyForm.grpcService ?? ''}
            onChange={(e) => setProxyForm((f) => ({ ...f, grpcService: e.target.value }))}
            placeholder="grpc-service-name"
          />
        </div>
      )
    }

    // WebSocket opts (conditional on network=ws)
    const renderWsFields = () => {
      if (proxyForm.network !== 'ws') return null
      if (!['vless', 'vmess', 'trojan'].includes(protocol)) return null
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>WS Path</Label>
            <Input
              value={proxyForm.wsPath ?? ''}
              onChange={(e) => setProxyForm((f) => ({ ...f, wsPath: e.target.value }))}
              placeholder="/ws"
            />
          </div>
          <div className="space-y-2">
            <Label>WS Host</Label>
            <Input
              value={proxyForm.wsHost ?? ''}
              onChange={(e) => setProxyForm((f) => ({ ...f, wsHost: e.target.value }))}
              placeholder="example.com"
            />
          </div>
        </div>
      )
    }

    // SS specific
    const renderSsFields = () => {
      if (protocol !== 'ss') return null
      return (
        <>
          <div className="space-y-2">
            <Label>Cipher</Label>
            <Select
              value={proxyForm.cipher ?? 'aes-256-gcm'}
              onValueChange={(v) => setProxyForm((f) => ({ ...f, cipher: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SS_CIPHER_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>UDP</Label>
            <Switch
              checked={proxyForm.udp ?? false}
              onCheckedChange={(checked) => setProxyForm((f) => ({ ...f, udp: checked }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Plugin</Label>
            <Select
              value={proxyForm.plugin ?? ''}
              onValueChange={(v) => setProxyForm((f) => ({ ...f, plugin: v }))}
            >
              <SelectTrigger><SelectValue placeholder="Select plugin" /></SelectTrigger>
              <SelectContent>
                {SS_PLUGIN_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p || 'none'}>{p || 'None'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {proxyForm.plugin === 'obfs' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Plugin Mode</Label>
                <Input
                  value={proxyForm.pluginOptsMode ?? ''}
                  onChange={(e) => setProxyForm((f) => ({ ...f, pluginOptsMode: e.target.value }))}
                  placeholder="http / tls"
                />
              </div>
              <div className="space-y-2">
                <Label>Plugin Host</Label>
                <Input
                  value={proxyForm.pluginOptsHost ?? ''}
                  onChange={(e) => setProxyForm((f) => ({ ...f, pluginOptsHost: e.target.value }))}
                  placeholder="example.com"
                />
              </div>
            </div>
          )}
        </>
      )
    }

    // SSR specific
    const renderSsrFields = () => {
      if (protocol !== 'ssr') return null
      return (
        <>
          <div className="space-y-2">
            <Label>Cipher</Label>
            <Select
              value={proxyForm.cipher ?? 'aes-256-cfb'}
              onValueChange={(v) => setProxyForm((f) => ({ ...f, cipher: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SSR_CIPHER_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Protocol</Label>
              <Select
                value={proxyForm.ssrProtocol ?? 'origin'}
                onValueChange={(v) => setProxyForm((f) => ({ ...f, ssrProtocol: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SSR_PROTOCOL_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Obfs</Label>
              <Select
                value={proxyForm.obfs ?? 'plain'}
                onValueChange={(v) => setProxyForm((f) => ({ ...f, obfs: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SSR_OBFS_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Obfs Param</Label>
            <Input
              value={proxyForm.obfsParam ?? ''}
              onChange={(e) => setProxyForm((f) => ({ ...f, obfsParam: e.target.value }))}
              placeholder="Optional obfs param"
            />
          </div>
        </>
      )
    }

    // WireGuard specific
    const renderWireguardFields = () => {
      if (protocol !== 'wireguard') return null
      return (
        <>
          <div className="space-y-2">
            <Label>Public Key</Label>
            <Input
              value={proxyForm.publicKey ?? ''}
              onChange={(e) => setProxyForm((f) => ({ ...f, publicKey: e.target.value }))}
              placeholder="Public key"
            />
          </div>
          <div className="space-y-2">
            <Label>Preshared Key (optional)</Label>
            <Input
              value={proxyForm.presharedKey ?? ''}
              onChange={(e) => setProxyForm((f) => ({ ...f, presharedKey: e.target.value }))}
              placeholder="Preshared key"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>DNS (optional)</Label>
              <Input
                value={proxyForm.dns ?? ''}
                onChange={(e) => setProxyForm((f) => ({ ...f, dns: e.target.value }))}
                placeholder="1.1.1.1"
              />
            </div>
            <div className="space-y-2">
              <Label>MTU (optional)</Label>
              <Input
                type="number"
                value={proxyForm.mtu ?? ''}
                onChange={(e) => setProxyForm((f) => ({ ...f, mtu: parseInt(e.target.value) || undefined }))}
                placeholder="1280"
              />
            </div>
          </div>
        </>
      )
    }

    // ALPN (vless/vmess)
    const renderAlpnField = () => {
      if (!['vless', 'vmess'].includes(protocol)) return null
      return (
        <div className="space-y-2">
          <Label>ALPN (optional)</Label>
          <Input
            value={proxyForm.alpn ?? ''}
            onChange={(e) => setProxyForm((f) => ({ ...f, alpn: e.target.value }))}
            placeholder="h2,http/1.1"
          />
        </div>
      )
    }

    return (
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {/* Protocol selector */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Protocol</Label>
          <div className="grid grid-cols-4 gap-2">
            {PROTOCOLS.map((p) => (
              <Button
                key={p.value}
                type="button"
                variant={proxyForm.protocol === p.value ? 'default' : 'outline'}
                size="sm"
                className={`text-xs ${proxyForm.protocol === p.value ? PROTOCOL_COLORS[p.value] + ' border-2 font-bold' : ''}`}
                onClick={() => handleProtocolChange(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Common fields: Address + Port */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-2">
            <Label>Address</Label>
            <Input
              value={proxyForm.address ?? ''}
              onChange={(e) => setProxyForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="node.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            <Input
              type="number"
              value={proxyForm.port ?? 443}
              onChange={(e) => setProxyForm((f) => ({ ...f, port: parseInt(e.target.value) || 443 }))}
            />
          </div>
        </div>

        {/* Auth fields */}
        {renderAuthField()}

        <Separator />

        {/* Protocol-specific fields */}
        {renderVlessFields()}
        {renderVmessFields()}
        {renderNetworkField()}
        {renderTlsField()}
        {renderSniField()}
        {renderSkipCertVerify()}
        {renderAlpnField()}
        {renderRealityFields()}
        {renderGrpcFields()}
        {renderWsFields()}
        {renderSsFields()}
        {renderSsrFields()}
        {renderWireguardFields()}
      </div>
    )
  }

  // ─── PRESET LIST VIEW ──────────────────────────────────────────

  if (!selectedPreset) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Proxy Presets</h1>
            <p className="text-muted-foreground text-sm">
              Manage proxy presets, subgroups, and per-protocol configurations
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
            const totalProxies = preset.subgroups.reduce((sum, sg) => sum + sg.proxies.length, 0)
            const protocolCounts = preset.subgroups.reduce((acc, sg) => {
              sg.proxies.forEach((px) => {
                acc[px.protocol] = (acc[px.protocol] || 0) + 1
              })
              return acc
            }, {} as Record<string, number>)
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
                  {/* Protocol badges */}
                  {Object.keys(protocolCounts).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(protocolCounts).map(([proto, count]) => (
                        <Badge key={proto} variant="outline" className={`text-xs ${PROTOCOL_COLORS[proto as ProxyProtocol] ?? ''}`}>
                          {proto.toUpperCase()} ×{count}
                        </Badge>
                      ))}
                    </div>
                  )}
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
                {editingPreset ? 'Update preset details' : 'Create a new proxy preset with subgroups'}
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
              <Button variant="outline" onClick={() => setPresetDialogOpen(false)}>Cancel</Button>
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
                This will permanently delete this preset and all its subgroups and proxies. This action cannot be undone.
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
      </div>
    )
  }

  // ─── PRESET DETAIL VIEW ────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedPresetId(null)}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{selectedPreset.name}</h1>
            <p className="text-sm text-muted-foreground">{selectedPreset.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openEditPreset(selectedPreset)} className="gap-2">
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => confirmDeletePreset(selectedPreset.id)} className="gap-2">
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
                {selectedPreset.subgroups.reduce((s, sg) => s + sg.proxies.length, 0)}
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
          <Button variant="outline" onClick={healthCheckAll} disabled={healthCheckRunning} className="gap-2">
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
              <CardHeader className="cursor-pointer" onClick={() => toggleSubgroup(sg.id)}>
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
                        <Badge variant="outline" className="text-xs">{sg.status}</Badge>
                      </div>
                      <CardDescription>{sg.proxies.length} proxies</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => openAddProxy(sg.id)} className="gap-1.5">
                      <Plus className="size-3.5" />
                      Add
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => healthCheckSubgroup(sg.id)} className="gap-1.5">
                      <HeartPulse className="size-3.5" />
                      Check
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openBulkUpload(sg.id)} className="gap-1.5">
                      <Upload className="size-3.5" />
                      Bulk
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteSubgroup(sg.id)} className="text-red-500 hover:text-red-400">
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
                          onChange={(e) => updateSubgroupImageSize(sg.id, parseInt(e.target.value) || 200, sg.imageHeight)}
                          className="w-20"
                        />
                      </div>
                      <span className="text-muted-foreground">×</span>
                      <div className="space-y-1">
                        <Label className="text-xs">Height</Label>
                        <Input
                          type="number"
                          value={sg.imageHeight}
                          onChange={(e) => updateSubgroupImageSize(sg.id, sg.imageWidth, parseInt(e.target.value) || 100)}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Proxy Table */}
                  {sg.proxies.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No proxies in this subgroup. Click &quot;Add&quot; or &quot;Bulk&quot; to add proxies.
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Address:Port</TableHead>
                            <TableHead>Protocol</TableHead>
                            <TableHead>Network</TableHead>
                            <TableHead>TLS</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Latency</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sg.proxies.map((proxy) => (
                            <TableRow key={proxy.id}>
                              <TableCell className="font-mono text-sm">
                                {proxy.address}:{proxy.port}
                              </TableCell>
                              <TableCell>
                                <ProtocolBadge protocol={proxy.protocol} />
                              </TableCell>
                              <TableCell>
                                {proxy.network ? (
                                  <Badge variant="outline" className="text-xs">{proxy.network.toUpperCase()}</Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {proxy.tls !== undefined ? (
                                  <Badge variant={proxy.tls ? 'default' : 'secondary'} className="text-xs">
                                    {proxy.tls ? 'TLS' : 'No'}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
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
                                    onClick={() => openEditProxy(sg.id, proxy)}
                                    className="size-8 p-0"
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
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
            <Button variant="outline" onClick={() => setPresetDialogOpen(false)}>Cancel</Button>
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

      {/* Add/Edit Proxy Dialog */}
      <Dialog open={proxyDialogOpen} onOpenChange={setProxyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProxy ? 'Edit Proxy' : 'Add Proxy'}</DialogTitle>
            <DialogDescription>
              {editingProxy
                ? `Editing ${editingProxy.protocol.toUpperCase()} proxy at ${editingProxy.address}:${editingProxy.port}`
                : 'Configure a new proxy with protocol-specific settings'}
            </DialogDescription>
          </DialogHeader>
          {renderProxyFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProxyDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveProxy}>{editingProxy ? 'Update' : 'Add Proxy'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Proxies</DialogTitle>
            <DialogDescription>
              Add multiple proxies at once using CSV or JSON format
            </DialogDescription>
          </DialogHeader>
          <Tabs value={bulkUploadTab} onValueChange={setBulkUploadTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv">CSV</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="csv" className="space-y-3">
              <div className="space-y-2">
                <Label>CSV Data</Label>
                <Textarea
                  value={bulkUploadData}
                  onChange={(e) => setBulkUploadData(e.target.value)}
                  placeholder={`protocol,address,port,uuid,password,...\nvless,node.example.com,443,your-uuid,,ws,true,...`}
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Example formats by protocol</Label>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {Object.entries(csvExamples).map(([proto, example]) => (
                    <details key={proto} className="group">
                      <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                        {proto.toUpperCase()} CSV Format
                      </summary>
                      <pre className="mt-1 rounded-md bg-muted p-2 text-[10px] leading-relaxed overflow-x-auto">
                        {example}
                      </pre>
                    </details>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="json" className="space-y-3">
              <div className="space-y-2">
                <Label>JSON Data</Label>
                <Textarea
                  value={bulkUploadData}
                  onChange={(e) => setBulkUploadData(e.target.value)}
                  placeholder='[{"protocol":"vless","address":"...","port":443,"uuid":"..."}]'
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Example formats by protocol</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 text-xs"
                    onClick={() => {
                      const currentExample = jsonExamples[(Object.keys(jsonExamples) as Array<keyof typeof jsonExamples>)[0]]
                      if (currentExample) {
                        setBulkUploadData(currentExample)
                        toast.success('Example loaded')
                      }
                    }}
                  >
                    <Copy className="size-3" />
                    Use Example
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {Object.entries(jsonExamples).map(([proto, example]) => (
                    <details key={proto} className="group">
                      <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                        {proto.toUpperCase()} JSON Format
                      </summary>
                      <pre className="mt-1 rounded-md bg-muted p-2 text-[10px] leading-relaxed overflow-x-auto">
                        {example}
                      </pre>
                    </details>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkUploadOpen(false)}>Cancel</Button>
            <Button onClick={processBulkUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subgroup Dialog */}
      <Dialog open={subgroupDialogOpen} onOpenChange={setSubgroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subgroup</DialogTitle>
            <DialogDescription>Create a new subgroup within this preset</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subgroup Name</Label>
              <Input
                value={subgroupForm.name}
                onChange={(e) => setSubgroupForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Dhaka"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Image Width</Label>
                <Input
                  type="number"
                  value={subgroupForm.imageWidth}
                  onChange={(e) => setSubgroupForm((f) => ({ ...f, imageWidth: parseInt(e.target.value) || 200 }))}
                  className="w-20"
                />
              </div>
              <span className="text-muted-foreground">×</span>
              <div className="space-y-1">
                <Label className="text-xs">Image Height</Label>
                <Input
                  type="number"
                  value={subgroupForm.imageHeight}
                  onChange={(e) => setSubgroupForm((f) => ({ ...f, imageHeight: parseInt(e.target.value) || 100 }))}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubgroupDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveSubgroup}>Add Subgroup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
