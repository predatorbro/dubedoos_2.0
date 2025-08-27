import DisplayQuickee from "../DisplayQuickee";
import { deleteQuickees, editQuickees, statusUpdate } from "@/store/features/quickySlice";
import { memo, useCallback, useMemo, useState, type ChangeEvent, type MouseEvent as ReactMouseEvent } from "react";
import { useDispatch } from "react-redux";
import SpecButton from "../specButton";
import { Pencil, Save, Trash } from "lucide-react";
import type { AppDispatch } from "@/store/store";
import QuickInput from "../QuickInput";
import axios from "axios";
import { toast } from "sonner";

interface props {
    id: string,
    todo: string,
    status: boolean
}
function Quickee({ id, todo, status }: props) {

    const dispatch = useDispatch<AppDispatch>();
    const [editing, setEditing] = useState(false);
    const [quickee, setQuickee] = useState<string>(todo);

    const editHandler = useCallback(() => {
        if (editing) {
            dispatch(editQuickees({ kee: id, text: quickee }));
            setEditing(false);
        } else {
            setEditing(true);
        }
    }, [editing, quickee]);

    const [magicTodoLoading, setMagicTodoLoading] = useState<boolean>(false)

    const handleDoubleClick = useCallback((e: ReactMouseEvent) => {
        e.stopPropagation();
        setMagicTodoLoading(true)
        let words: string[] = [];

        axios.post('/api/chat', { message: quickee }).then((response) => {
            const text = response.data.text;
            words = text.split(" ");

            let current = "";
            words.forEach((word: string, i: number) => {
                setTimeout(() => {
                    current += (current ? " " : "") + word;
                    setQuickee(current);
                }, i * 100);
            });

            setTimeout(() => {
                toast.success("Changes saved successfully!");
                dispatch(editQuickees({ kee: id, text: current }));
            }, words.length * 100 + 500);

        }).catch((error) => {
            console.error("Error generating magic title:", error);
            setTimeout(() => {
                toast.error("Error : " + error.response.data.error);
            }, 1000);
        }).finally(() => {
            setMagicTodoLoading(false);
        });
    }, [dispatch, id, quickee]);

    const handleCheckedChange = useCallback(() => {
        dispatch(statusUpdate(id))
    }, [dispatch, id]);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setQuickee(e.target.value);
    }, []);

    const editSaveIcon = useMemo(() => (
        editing
            ? <Save className="-ms-1 opacity-60" size={16} aria-hidden="true" color="#10B981" />
            : <Pencil className="-ms-1 opacity-60" size={16} aria-hidden="true" color="#3B82F6" />
    ), [editing]);

    const trashIcon = useMemo(() => (
        <Trash className="-ms-1 opacity-60" size={16} aria-hidden="true" color="#EF4444" />
    ), []);

    const displayQuickee = useMemo(() => (
        <DisplayQuickee
            magicTodoLoading={magicTodoLoading}
            onDoubleClick={handleDoubleClick}
            id={id}
            value={quickee}
            checked={status}
            onCheckedChange={handleCheckedChange}
        />
    ), [handleCheckedChange, handleDoubleClick, id, magicTodoLoading, quickee, status]);

    return (
        <div className="flex text-red-500">
            {
                !editing && displayQuickee
            }
            {
                editing &&
                <QuickInput id={id} className="shadow-none py-0 text-ring text-sm outline-none border-none pl-10" value={quickee} onChange={handleInputChange} placeHolder="List your todos..." disabled />
            }

            <SpecButton className="border-blue-500 scale-75 cursor-pointer" children={editSaveIcon} onClick={editHandler} />

            <SpecButton onClick={useCallback(() => { dispatch(deleteQuickees(id)) }, [dispatch, id])}
                className="border-red-500 scale-75 cursor-pointer"
                children={trashIcon}
            />

        </div>

    )
}

export default memo(Quickee)