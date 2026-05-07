'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { FileEdit, Eye, Plus, Trash2, Save } from 'lucide-react'

interface Feature {
  title: string
  description: string
}

interface LandingPageData {
  heroHeadline: string
  heroSubtitle: string
  features: Feature[]
  ctaText: string
}

interface DocArticle {
  id: string
  title: string
  description: string
  content: string
  category: string
}

const defaultLandingData: LandingPageData = {
  heroHeadline: 'Enterprise Security, Simplified',
  heroSubtitle: 'Military-grade VPN protection with seamless device management. Protect your digital life with CoreX.',
  features: [
    { title: 'Military-Grade Encryption', description: '256-bit AES encryption ensures your data remains completely secure and private at all times.' },
    { title: 'Device Management', description: 'Manage and monitor all connected devices from a single dashboard with granular control.' },
    { title: 'Seamless Authentication', description: 'Quick login with Google or Telegram — no passwords needed, just secure instant access.' },
    { title: 'Real-time Monitoring', description: 'Track bandwidth usage, connection status, and security events as they happen.' },
  ],
  ctaText: 'Get Started Today',
}

const defaultDocArticles: DocArticle[] = [
  {
    id: 'doc_001',
    title: 'Getting Started with CoreX',
    description: 'Learn how to set up and configure CoreX on your device',
    content: '# Getting Started\n\nWelcome to CoreX! This guide will walk you through the initial setup process.\n\n## Step 1: Download\n\nDownload the CoreX APK from the official website or your dashboard.\n\n## Step 2: Install\n\nEnable installation from unknown sources in your device settings.\n\n## Step 3: Configure\n\nOpen the app and follow the on-screen instructions to configure your proxy.',
    category: 'Getting Started',
  },
  {
    id: 'doc_002',
    title: 'Configuring Proxy Presets',
    description: 'How to select and apply proxy presets for optimal performance',
    content: '# Configuring Proxy Presets\n\nProxy presets allow you to quickly switch between different server configurations.\n\n## Selecting a Preset\n\n1. Open the CoreX app\n2. Go to Settings > Proxy\n3. Choose your preferred preset\n\n## Available Presets\n\n- **Bangladesh Premium**: Optimized for BD users\n- **Asia Pacific**: Wide APAC coverage\n- **Global Mix**: Balanced worldwide distribution',
    category: 'Configuration',
  },
  {
    id: 'doc_003',
    title: 'Managing Active Devices',
    description: 'Add, remove, and manage devices linked to your subscription',
    content: '# Managing Active Devices\n\nYour subscription allows a limited number of devices to be active simultaneously.\n\n## Adding a Device\n\nOpen the app on your new device and log in with your account.\n\n## Releasing a Device\n\nGo to Dashboard > Active Devices and click "Release" on the device you want to remove.',
    category: 'Configuration',
  },
  {
    id: 'doc_004',
    title: 'Payment Methods',
    description: 'Supported payment methods and how to add balance',
    content: '# Payment Methods\n\nCoreX supports local payment methods for your convenience.\n\n## bKash\n\n1. Go to Dashboard > Payments\n2. Click "Add Balance"\n3. Select bKash and enter the amount\n4. Complete the payment and submit the transaction ID\n\n## Nagad\n\nFollow the same steps and select Nagad as your payment method.',
    category: 'Billing',
  },
  {
    id: 'doc_005',
    title: 'Referral Program',
    description: 'Earn credits by referring friends to CoreX',
    content: '# Referral Program\n\nShare your unique referral code and earn $5.00 for each successful referral.\n\n## How It Works\n\n1. Copy your referral code from Dashboard > Referrals\n2. Share it with friends\n3. When they sign up and make their first payment, you earn $5.00',
    category: 'Billing',
  },
  {
    id: 'doc_006',
    title: 'Troubleshooting Connection Issues',
    description: 'Common solutions for connectivity problems',
    content: '# Troubleshooting\n\nHaving trouble connecting? Try these steps:\n\n1. **Check your internet connection** — Make sure Wi-Fi or mobile data is working\n2. **Switch proxy preset** — Try a different server location\n3. **Restart the app** — Close and reopen CoreX\n4. **Update the app** — Make sure you have the latest version',
    category: 'Troubleshooting',
  },
]

const docCategories = ['Getting Started', 'Configuration', 'Billing', 'Troubleshooting', 'API Reference', 'Security']

export function AdminCmsPage() {
  const [landingData, setLandingData] = useState<LandingPageData>(defaultLandingData)
  const [docArticles, setDocArticles] = useState<DocArticle[]>(defaultDocArticles)
  const [selectedCategory, setSelectedCategory] = useState('Getting Started')
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const categoryArticles = docArticles.filter((a) => a.category === selectedCategory)

  const handleLandingChange = (field: keyof LandingPageData, value: string) => {
    setLandingData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
    setLandingData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }))
  }

  const handleSaveLanding = () => {
    toast.success('Landing page changes saved successfully')
  }

  const handlePreview = () => {
    setPreviewOpen(true)
  }

  const handleSelectArticle = (article: DocArticle) => {
    setSelectedArticle({ ...article })
  }

  const handleArticleChange = (field: keyof DocArticle, value: string) => {
    if (!selectedArticle) return
    setSelectedArticle((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleSaveArticle = () => {
    if (!selectedArticle) return
    setDocArticles((prev) =>
      prev.map((a) => (a.id === selectedArticle.id ? { ...selectedArticle } : a))
    )
    toast.success('Article saved successfully')
  }

  const handleAddArticle = () => {
    const newArticle: DocArticle = {
      id: `doc_${Date.now()}`,
      title: '',
      description: '',
      content: '',
      category: selectedCategory,
    }
    setDocArticles((prev) => [...prev, newArticle])
    setSelectedArticle(newArticle)
    toast.success('New article created')
  }

  const handleDeleteArticle = (id: string) => {
    setDocArticles((prev) => prev.filter((a) => a.id !== id))
    if (selectedArticle?.id === id) {
      setSelectedArticle(null)
    }
    toast.success('Article deleted')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileEdit className="size-6 text-primary" />
          Content Management
        </h2>
        <p className="text-muted-foreground">Edit landing page and documentation content without code changes</p>
      </div>

      <Tabs defaultValue="landing">
        <TabsList>
          <TabsTrigger value="landing">Landing Page</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        {/* Landing Page Tab */}
        <TabsContent value="landing" className="space-y-4 mt-4">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Edit the main headline and subtitle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero-headline">Hero Headline</Label>
                <Input
                  id="hero-headline"
                  value={landingData.heroHeadline}
                  onChange={(e) => handleLandingChange('heroHeadline', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={landingData.heroSubtitle}
                  onChange={(e) => handleLandingChange('heroSubtitle', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Edit the four feature cards displayed on the landing page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {landingData.features.map((feature, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-4">
                  <Label className="text-sm font-semibold text-primary">Feature {index + 1}</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Feature title"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Feature description"
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader>
              <CardTitle>Call to Action</CardTitle>
              <CardDescription>Edit the CTA button text</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="cta-text">CTA Text</Label>
                <Input
                  id="cta-text"
                  value={landingData.ctaText}
                  onChange={(e) => handleLandingChange('ctaText', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="size-4 mr-1" />
              Preview Changes
            </Button>
            <Button onClick={handleSaveLanding}>
              <Save className="size-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentation Editor</CardTitle>
              <CardDescription>Manage documentation articles by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category selector */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {docCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Article list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Articles in &quot;{selectedCategory}&quot; ({categoryArticles.length})
                  </Label>
                  <Button variant="outline" size="sm" onClick={handleAddArticle}>
                    <Plus className="size-3.5 mr-1" />
                    Add New Article
                  </Button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {categoryArticles.map((article) => (
                    <div
                      key={article.id}
                      className={`flex items-center justify-between rounded-md border p-2 cursor-pointer transition-colors ${
                        selectedArticle?.id === article.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectArticle(article)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {article.title || 'Untitled Article'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{article.description}</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 text-destructive hover:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Article</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{article.title || 'Untitled Article'}&quot;?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteArticle(article.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                  {categoryArticles.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No articles in this category
                    </p>
                  )}
                </div>
              </div>

              {/* Article Editor */}
              {selectedArticle && (
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-semibold text-primary">Edit Article</h3>
                  <div className="space-y-2">
                    <Label htmlFor="article-title">Title</Label>
                    <Input
                      id="article-title"
                      value={selectedArticle.title}
                      onChange={(e) => handleArticleChange('title', e.target.value)}
                      placeholder="Article title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="article-desc">Description</Label>
                    <Textarea
                      id="article-desc"
                      value={selectedArticle.description}
                      onChange={(e) => handleArticleChange('description', e.target.value)}
                      placeholder="Brief description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="article-content">Content (Markdown)</Label>
                    <Textarea
                      id="article-content"
                      value={selectedArticle.content}
                      onChange={(e) => handleArticleChange('content', e.target.value)}
                      placeholder="Write your article content in markdown..."
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveArticle} size="sm">
                      <Save className="size-3.5 mr-1" />
                      Save
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="size-3.5 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Article</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this article? This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteArticle(selectedArticle.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Landing Page Preview</DialogTitle>
            <DialogDescription>This is a simplified preview of your landing page changes</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Hero Preview */}
            <div className="text-center space-y-3 py-8 rounded-lg bg-gradient-to-b from-primary/10 to-transparent">
              <h1 className="text-3xl font-bold">{landingData.heroHeadline}</h1>
              <p className="text-muted-foreground max-w-md mx-auto">{landingData.heroSubtitle}</p>
              <Button>{landingData.ctaText}</Button>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {landingData.features.map((feature, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-2">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
