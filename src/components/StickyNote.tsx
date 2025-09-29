"use client"

import { useState, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { X, Edit2, Pin, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useDispatch } from "react-redux"
import { updateStickyNote, deleteStickyNote, StickyNote } from "@/store/features/stickyNotesSlice"
import { toast } from "sonner"

interface StickyNoteProps {
  note: StickyNote
  index: number
}

const StickyNoteComponent = ({ note, index }: StickyNoteProps) => {
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const lastTapRef = useRef<number>(0)

  // Generate random positioning and rotation for realistic sticky note look
  const randomTransform = useMemo(() => {
    return {
      rotation: (Math.random() - 0.5) * 16, // Random rotation between -8 and +8 degrees
      scale: 0.9 + (Math.random() * 0.2), // Slight size variation between 0.9 and 1.1
      x: (Math.random() - 0.5) * 20, // Small horizontal offset between -10 and +10
      y: (Math.random() - 0.5) * 20, // Small vertical offset between -10 and +10
    }
  }, [index])

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content cannot be empty!")
      return
    }

    dispatch(updateStickyNote({
      id: note.id,
      title: title.trim(),
      content: content.trim()
    }))
    setIsEditing(false)
    toast.success("Sticky note updated!")
  }

  const handleDelete = () => {
    dispatch(deleteStickyNote(note.id))
    toast.success("Sticky note deleted!")
  }

  const handleCancel = () => {
    setTitle(note.title)
    setContent(note.content)
    setIsEditing(false)
  }


  const getStickyNoteStyle = () => {
    const colors = {
      neutral: "bg-card border-border shadow-muted/60",
      white: "bg-card border-gray-200 shadow-gray-200/60",
      black: "bg-card border-gray-800 shadow-gray-800/60",
    }

    return colors[note.color as keyof typeof colors] || colors.neutral
  }

  const getDarkStickyNoteStyle = () => {
    const colors = {
      neutral: "dark:bg-card dark:border-border dark:shadow-muted/30",
      white: "dark:bg-card dark:border-gray-300 dark:shadow-gray-300/30",
      black: "dark:bg-card dark:border-gray-600 dark:shadow-gray-600/30",
    }

    return colors[note.color as keyof typeof colors] || colors.neutral
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: randomTransform.rotation - 10 }}
      animate={{
        opacity: 1,
        scale: randomTransform.scale,
        rotate: randomTransform.rotation,
        x: randomTransform.x,
        y: randomTransform.y
      }}
      exit={{ opacity: 0, scale: 0.8, rotate: randomTransform.rotation + 10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`group
         relative max-h-52 h-full min-h-5max-h-52 w-full p-3 border-2 shadow-lg hover:shadow-xl transition-all duration-300
         ${getStickyNoteStyle()} ${getDarkStickyNoteStyle()}
         transform hover:scale-105 hover:rotate-1 cursor-pointer
         overflow-hidden
       `}
      style={{
        transformOrigin: 'top left',
        boxShadow: '0 6px 12px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)',
        borderStyle: 'solid',
        borderWidth: '2px',
        borderRadius: '0',
      }} 
    >
      {/* Pushpin */}
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
        <Pin size={14} className="text-red-500 rotate-45 drop-shadow-sm" />
      </div>

      {/* Delete button */}
      <div className="absolute top-1 right-1 z-20">
        <Button
          size="icon"
          className="h-5 w-5 bg-transparent hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity text-destructive p-0"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          <Trash  className="size-3" />
        </Button>
      </div>


      {/* Content */}
      <div className="pt-4 h-full flex flex-col">
        {isEditing ? (
          <div className="flex flex-col gap-2 h-full">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
              className="text-sm font-semibold border-0 bg-transparent p-0 h-auto focus:ring-0"
              onClick={(e) => e.stopPropagation()}
            />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content..."
              className="flex-1 text-xs border-0 bg-transparent p-0 resize-none focus:ring-0"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-1 mt-auto">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSave()
                }}
                className="text-xs px-2 py-1 h-auto"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancel()
                }}
                className="text-xs px-2 py-1 h-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="h-full flex flex-col cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
          >
            <h3 className="text-sm font-semibold mb-2 line-clamp-2 break-words text-gray-800 dark:text-gray-200">
              {note.title}
            </h3>
            <p className="text-xs flex-1 line-clamp-6 break-words overflow-hidden text-gray-700 dark:text-gray-300 leading-relaxed">
              {note.content}
            </p>
            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit2 size={10} className="text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Folded corner effect - more realistic */}
      <div className="absolute bottom-0 right-0">
        <div
          className="w-0 h-0 border-l-[16px] border-l-transparent border-b-[16px]"
          style={{ borderBottomColor: 'rgba(0,0,0,0.1)' }}
        ></div>
      </div>

      {/* Hand-drawn border effect */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 192 192">
          <path
            d="M2 2 L190 2 L188 4 L190 6 L188 8 L190 10 L188 12 L190 14 L188 16 L190 18 L188 20 L190 22 L188 24 L190 26 L188 28 L190 30 L188 32 L190 34 L188 36 L190 38 L188 40 L190 42 L188 44 L190 46 L188 48 L190 50 L188 52 L190 54 L188 56 L190 58 L188 60 L190 62 L188 64 L190 66 L188 68 L190 70 L188 72 L190 74 L188 76 L190 78 L188 80 L190 82 L188 84 L190 86 L188 88 L190 90 L188 92 L190 94 L188 96 L190 98 L188 100 L190 102 L188 104 L190 106 L188 108 L190 110 L188 112 L190 114 L188 116 L190 118 L188 120 L190 122 L188 124 L190 126 L188 128 L190 130 L188 132 L190 134 L188 136 L190 138 L188 140 L190 142 L188 144 L190 146 L188 148 L190 150 L188 152 L190 154 L188 156 L190 158 L188 160 L190 162 L188 164 L190 166 L188 168 L190 170 L188 172 L190 174 L188 176 L190 178 L188 180 L190 182 L188 184 L190 186 L188 188 L190 190 L2 190 L4 188 L2 186 L4 184 L2 182 L4 180 L2 178 L4 176 L2 174 L4 172 L2 170 L4 168 L2 166 L4 164 L2 162 L4 160 L2 158 L4 156 L2 154 L4 152 L2 150 L4 148 L2 146 L4 144 L2 142 L4 140 L2 138 L4 136 L2 134 L4 132 L2 130 L4 128 L2 126 L4 124 L2 122 L4 120 L2 118 L4 116 L2 114 L4 112 L2 110 L4 108 L2 106 L4 104 L2 102 L4 100 L2 98 L4 96 L2 94 L4 92 L2 90 L4 88 L2 86 L4 84 L2 82 L4 80 L2 78 L4 76 L2 74 L4 72 L2 70 L4 68 L2 66 L4 64 L2 62 L4 60 L2 58 L4 56 L2 54 L4 52 L2 50 L4 48 L2 46 L4 44 L2 42 L4 40 L2 38 L4 36 L2 34 L4 32 L2 30 L4 28 L2 26 L4 24 L2 22 L4 20 L2 18 L4 16 L2 14 L4 12 L2 10 L4 8 L2 6 L4 4 Z"
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  )
}

export default StickyNoteComponent
