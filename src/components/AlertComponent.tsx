import { useState } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
  text: string
}

export default function useConfirmDialog({ text }: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => () => { })

  const confirm = () => {
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve)
    })
  }

  const handleClose = (result: boolean) => {
    setOpen(false)
    resolvePromise(result)
  }

  const ConfirmDialog = (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {text || "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleClose(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => handleClose(true)}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirm, ConfirmDialog }
}
