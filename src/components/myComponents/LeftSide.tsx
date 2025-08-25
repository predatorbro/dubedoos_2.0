import QuickInput from "../QuickInput";
import SpecButton from "../specButton";
import { SquarePen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { addQuickees, Todo } from "@/store/features/quickySlice";
import { useState } from "react";
import type { RootState } from "@/store/store";
import Quickee from "./Quickee";
import { AnimatePresence, motion } from "framer-motion";

export default function LeftSide() {
    const dispatch = useDispatch<AppDispatch>();
    const [quickee, setQuickee] = useState<string>("");

    // quickesee list
    const quickeesList = useSelector((state: RootState) => state.quicky.quickees);

    const addQuickee = () => {
        dispatch(addQuickees(quickee))
        quickee && setQuickee("");
    }

    return (
        <div className="w-full md:w-[unset] md:min-w-1/2 xl:min-w-2/5 border rounded-md p-3 flex flex-col gap-3 border-gray-800 dark:border-gray-200/50 h-[unset] transition-all duration-500 ease-in-out">
            {/* add quickees */}
            <div className="flex gap-3">
                <QuickInput
                    id="quick-input"
                    className="py-5 px-3 text-ring text-base"
                    value={quickee}
                    onChange={(e) => setQuickee(e.target.value)}
                    placeHolder="List your todos..."
                    disabled
                />
                <SpecButton
                    onClick={addQuickee}
                    className="py-5"
                    text={"Add"}
                    children={<SquarePen className="-ms-1 opacity-60" size={16} aria-hidden="true" />}
                />
            </div>

            {/* animated quickees list */}
            {quickeesList.length > 0 && (
                <motion.div
                    className="flex flex-col gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="border-t"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    />

                    <AnimatePresence mode="popLayout">
                        {quickeesList.map((quickee: Todo, index: number) => (
                            <motion.div
                                key={quickee.id}
                                className="flex gap-3 flex-col"
                                initial={{ opacity: 0, y: 20, height: 0 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    height: "auto",
                                    transition: {
                                        opacity: { duration: 0.3 },
                                        y: { duration: 0.4 },
                                        height: { duration: 0.3 }
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -20,
                                    height: 0,
                                    transition: {
                                        opacity: { duration: 0.2 },
                                        y: { duration: 0.3 },
                                        height: { duration: 0.3 }
                                    }
                                }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.1,
                                    ease: "easeOut"
                                }}
                                layout // Smooth layout transitions
                            >
                                <Quickee
                                    id={quickee.id}
                                    todo={quickee.todo}
                                    status={quickee.status}
                                />
                                <motion.div
                                    className="border-t"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: (index * 0.1) + 0.2,
                                        ease: "easeOut"
                                    }}
                                />

                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    )
}