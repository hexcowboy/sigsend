import { useCollapse } from "react-collapsed";

import Caret from "@/ui/caret";

interface Props {
  children: React.ReactNode;
}

const Collapse = ({ children }: Props) => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  return (
    <div className="w-full">
      <span
        className="ml-2 flex select-none items-center text-sm text-neutral-500 dark:text-neutral-400"
        {...getToggleProps()}
      >
        {isExpanded ? "Hide ABI" : "Show ABI"}
        <Caret isOpen={isExpanded} />
      </span>
      <section {...getCollapseProps()}>{children}</section>
    </div>
  );
};

export default Collapse;
