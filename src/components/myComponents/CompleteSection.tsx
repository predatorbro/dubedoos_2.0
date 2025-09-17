import LeftSide from "./LeftSide";
import StickyNotesSection from "@/components/StickyNotesSection";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import Sections from "./AllSections";
import { memo } from "react";

function CompleteSection() {
  return (
    <>
      <div className="flex flex-row flex-wrap md:flex-nowrap gap-2 xl:gap-3">

        {/* left side - todos/quickees */}
        <LeftSide />

        {/* right side - grid layout: 2 cols for sticky notes, 1 col for upcoming events */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 xl:gap-3 w-full">
          {/* Sticky Notes Section - takes 2 columns on large screens, 1 column on smaller screens */}
          <div className="lg:col-span-3 border rounded-md p-3">
            <StickyNotesSection />
          </div>

          {/* Upcoming Events Section - takes 1 column on large screens, 1 column on smaller screens */}
          <div className="lg:col-span-2 border rounded-md p-3 relative">
            <UpcomingEventsSection />
          </div>
        </div>

      </div>

      {/* sections */}
      <Sections />
    </>

  );
}

export default memo(CompleteSection);
