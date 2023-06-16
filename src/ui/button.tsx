import { HTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  text: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const Button = (
  { text, icon, disabled, ...props }: Props,
  ref: React.Ref<HTMLButtonElement>
) => {
  return (
    <button
      {...props}
      ref={ref}
      className={twMerge(
        "relative flex items-center justify-center gap-1 rounded-xl bg-black px-4 py-2 text-lg font-bold text-white active:top-[1px] dark:bg-white dark:text-black",
        props.className,
        disabled
          ? "cursor-not-allowed opacity-80 active:top-[0] dark:opacity-50"
          : ""
      )}
      disabled={disabled}
    >
      {text}
      {icon}
    </button>
  );
};

export default forwardRef(Button);
