import { useState } from "react"

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// icons
import {
    Trash,
    Calendar,
    Paperclip, 
} from "lucide-react"
 

type ToolTipProps = {
    onDelete?: () => void;
    onPin?: () => void;
    onCopy?: () => void;
    onAttach?: () => void;
    currentNoteId: string;
    children: React.ReactNode
};

function ToolTipMain({
    onDelete,
    onAttach,
    children,
}: ToolTipProps) {

    const navigationLinks = [
        { label: "Deadline", icon: Calendar, action: () => console.log("Deadline") },
        { label: "Attach", icon: Paperclip, action: onAttach },
        { label: "Delete", icon: Trash, action: onDelete },
    ];

    const [toggleHideState, setToggleHideState] = useState<boolean>(true)




    return (
        <div>

         

        </div>
    )
}

export default ToolTipMain