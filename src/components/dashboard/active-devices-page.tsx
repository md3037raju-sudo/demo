'use client'

import React, { useState } from 'react'
import { mockActiveDevices } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { toast } from 'sonner'

export function ActiveDevicesPage() {
  const [devices, setDevices] = useState(mockActiveDevices)
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<typeof devices[0] | null>(null)

  const handleRelease = (device: typeof devices[0]) => {
    setSelectedDevice(device)
    setReleaseDialogOpen(true)
  }

  const confirmRelease = () => {
    if (selectedDevice) {
      setDevices((prev) => prev.filter((d) => d.id !== selectedDevice.id))
      toast.success(`${selectedDevice.name} has been released from your subscription.`)
    }
    setReleaseDialogOpen(false)
    setSelectedDevice(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Active Devices</h2>
        <p className="text-muted-foreground">
          Devices bound to your CoreX subscriptions
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Bind Date</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No active devices
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{device.os}</TableCell>
                    <TableCell>{device.subscription}</TableCell>
                    <TableCell>{device.bindDate}</TableCell>
                    <TableCell>{device.lastActive}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleRelease(device)}
                      >
                        Release
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Release Confirmation Dialog */}
      <AlertDialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unbind the device from your subscription. You can bind a
              new device later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRelease}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Release Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
