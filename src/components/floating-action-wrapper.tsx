"use client"

import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { Truck, Wrench, Activity, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function FloatingActionWrapper() {
  const router = useRouter()

  return (
    <FloatingActionButton
      expandable
      variant="default"
      size="lg"
      position="bottom-right"
      actions={[
        {
          icon: <Truck className="h-5 w-5" />,
          label: "Report Issue",
          onClick: () => router.push('/report'),
          variant: "default"
        },
        {
          icon: <Wrench className="h-5 w-5" />,
          label: "Workshop",
          onClick: () => router.push('/workshop'),
          variant: "secondary"
        },
        {
          icon: <Activity className="h-5 w-5" />,
          label: "Operations",
          onClick: () => router.push('/operations'),
          variant: "secondary"
        },
        {
          icon: <FileText className="h-5 w-5" />,
          label: "Troubleshoot",
          onClick: () => router.push('/troubleshoot'),
          variant: "secondary"
        }
      ]}
    />
  )
}