import { useCallback, useEffect } from "react";
import { RemoveScroll } from "react-remove-scroll";
import { twMerge } from "tailwind-merge";

import Portal from "@/providers/portal";
import Close from "@/ui/icons/close";

export enum ModalSize {
  Small = "max-w-[440px]",
  Medium = "max-w-[600px]",
  Large = "max-w-[800px]",
}

interface Props {
  onClose: () => void;
  title?: JSX.Element | string;
  children: React.ReactNode;
  color?: string;
  size?: ModalSize;
}

const stopPropagation: React.MouseEventHandler<unknown> = (event) =>
  event.stopPropagation();

const Modal = ({
  onClose,
  title,
  children,
  size = ModalSize.Medium,
}: Props) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleBackdropClick = useCallback(() => onClose(), [onClose]);

  return (
    <Portal>
      <RemoveScroll>
        <div
          onClick={handleBackdropClick}
          className="fixed left-0 top-0 z-50 flex flex h-screen w-screen items-center justify-center bg-black/50 backdrop-blur dark:bg-neutral-900/50"
        >
          <div
            onClick={stopPropagation}
            className={twMerge(
              "relative w-screen animate-modal rounded-2xl bg-white p-8 dark:bg-black sm:w-full",
              size
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{title}</h2>
              <span onClick={onClose} className="cursor-pointer">
                <Close />
              </span>
            </div>
            {children}
          </div>
        </div>
      </RemoveScroll>
    </Portal>
  );
};

export default Modal;
