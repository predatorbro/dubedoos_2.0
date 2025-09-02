import LeftSide from "./LeftSide";

import MultipleSelectionCalender from "@/components/Multi-Calendar";
import AdvancedCalendar from "@/components/AdvancedCalendar";
import Sections from "./AllSections";
import { memo } from "react";

function CompleteSection() {
  return (
    <>
      <div className="flex flex-row  flex-wrap md:flex-nowrap gap-2 xl:gap-3">

        {/* left side */}
        <LeftSide />

        {/* right side */}
        <AdvancedCalendar />

      </div>

      {/* sections */}
      <Sections />
    </>

  );
}

export default memo(CompleteSection);
