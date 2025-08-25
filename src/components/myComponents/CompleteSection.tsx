import LeftSide from "./LeftSide";

import MultipleSelectionCalender from "@/components/Multi-Calendar";
import AdvancedCalendar from "@/components/AdvancedCalendar";
import Sections from "./AllSections";

function CompleteSection() {
  return (
    <>
      <div className="flex flex-row  flex-wrap md:flex-nowrap gap-2 xl:gap-3 2xl:gap-5">

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

export default CompleteSection;
