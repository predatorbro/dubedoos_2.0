
import { Toggle } from "@/components/ui/toggle"

export default function Toggler({ primaryIcon, secondaryIcon, state, setState, disabled }: { primaryIcon: React.ReactNode, secondaryIcon: React.ReactNode, state: boolean, setState: React.Dispatch<React.SetStateAction<boolean>>, disabled?: boolean }) {

    return (
        <div>
            <Toggle
                variant="outline"
                className="group data-[state=on]:hover:bg-muted text-muted-foreground data-[state=on]:text-muted-foreground data-[state=on]:hover:text-foreground size-8   border-none shadow-none data-[state=on]:bg-transparent"
                pressed={state === false}
                onPressedChange={() =>
                    setState((prev) => (prev === false ? true : false))
                }
                disabled={disabled}
            >
                {/* Note: After dark mode implementation, rely on dark: prefix rather than group-data-[state=on]: */}
                {secondaryIcon}
                {primaryIcon}
            </Toggle>
        </div>
    )
}
