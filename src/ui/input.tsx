import { HTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Element = HTMLInputElement;
interface Props extends HTMLAttributes<Element> {
  value: string;
  setValue: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

const Input = (
  { value, setValue, label, disabled = false, ...props }: Props,
  ref: React.Ref<Element>
) => {
  return (
    <span
      className={twMerge(
        "flex w-full flex-col",
        disabled ? "pointer-events-none opacity-50" : ""
      )}
    >
      {label ? (
        <label className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        {...props}
        className={twMerge(
          "text-md h-12 rounded-xl border border-neutral-200 bg-white px-4 font-mono outline-none dark:border-neutral-700 dark:bg-black",
          props.className
        )}
        value={value}
        onChange={(e) => setValue((e.target as Element).value)}
      />
    </span>
  );
};

export default forwardRef(Input);
