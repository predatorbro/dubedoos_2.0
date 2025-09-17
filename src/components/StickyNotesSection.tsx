"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDispatch, useSelector } from "react-redux"
import { addStickyNote, selectStickyNotes, StickyNotesState } from "@/store/features/stickyNotesSlice"
import StickyNoteComponent from "./StickyNote"
import { toast } from "sonner"

const StickyNotesSection = () => {
  const dispatch = useDispatch()
  const stickyNotes = useSelector((state: { stickyNotes: StickyNotesState }) => selectStickyNotes(state))
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [selectedColor, setSelectedColor] = useState("neutral")

  const colors = [
    { name: "neutral", class: "bg-card border-border" },
    { name: "white", class: "bg-card border-gray-200" },
    { name: "black", class: "bg-card border-gray-800" },
  ]

  const handleAddStickyNote = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Title and content are required!")
      return
    }

    if (stickyNotes.length >= 6) {
      toast.error("Maximum 6 sticky notes allowed!")
      return
    }

    dispatch(addStickyNote({
      title: newTitle.trim(),
      content: newContent.trim(),
      color: selectedColor
    }))

    setNewTitle("")
    setNewContent("")
    setSelectedColor("neutral")
    setIsModalOpen(false)
    toast.success("Sticky note added!")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddStickyNote()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Sticky Notes</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="h-8 w-8 p-0 rounded-full bg-primary hover:bg-primary/90"
          disabled={stickyNotes.length >= 6}
          title={stickyNotes.length >= 6 ? "Maximum 6 sticky notes allowed" : "Add sticky note"}
        >
          <Plus size={16} />
        </Button>
      </div>

      {/* Sticky Notes Grid */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {stickyNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Plus size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No sticky notes yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the + button to create your first sticky note
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                size="sm"
                disabled={stickyNotes.length >= 6}
              >
                <Plus size={16} className="mr-2" />
                Add Sticky Note
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`grid grid-cols-2 gap-3 p-2 w-full h-full ${stickyNotes.length > 4 ? 'min-h-[600px]' : stickyNotes.length > 2 ? 'min-h-[400px]' : 'min-h-[200px]'}`}
            >
              <AnimatePresence>
                {stickyNotes.map((note, index) => (
                  <StickyNoteComponent key={note.id} note={note} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Sticky Note Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border shadow-lg">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-semibold text-center text-primary">
              Add Sticky Note
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title..."
                className="w-full"
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>

            {/* Content Input */}
            <div>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Content..."
                className="w-full min-h-[100px] resize-none"
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Palette size={16} />
                Color
              </label>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all duration-200
                      ${color.class}
                      ${selectedColor === color.name
                        ? 'ring-2 ring-primary ring-offset-2 scale-110'
                        : 'hover:scale-105'
                      }
                    `}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAddStickyNote}
                className="flex-1"
                disabled={!newTitle.trim() || !newContent.trim()}
              >
                Add Note
              </Button>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            {/* Keyboard shortcut hint */}
            <p className="text-xs text-muted-foreground text-center">
              Press Ctrl+Enter to quickly add the note
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StickyNotesSection
