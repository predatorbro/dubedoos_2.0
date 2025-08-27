
import { useSelector } from "react-redux";
import OneSection from "./OneSection";
import { memo } from "react";

const Sections = () => {
    const sections = useSelector((state: any) => state.notez.sections);
    return (
        <div className="flex flex-col justify-center items-start mt-2 xl:mt-3 2xl:mt-5 ">
            {
                sections.map((section: any, index: number) => (
                    <OneSection key={index} sectionData={section} />
                ))
            }
        </div>
    )
}

export default memo(Sections)