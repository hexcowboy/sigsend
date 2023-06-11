import { HTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Element = HTMLInputElement;
interface Props extends HTMLAttributes<Element> {
  value: string;
  setValue: (value: string) => void;
  label?: string;
}

const Input = (
  { value, setValue, label, ...props }: Props,
  ref: React.Ref<Element>
) => {
  return (
    <span className="flex w-full flex-col">
      {label ? (
        <label className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        {...props}
        className={twMerge(
          "text-md h-10 rounded-xl border border-transparent bg-white px-4 font-mono outline-none drop-shadow dark:border-neutral-700 dark:bg-black",
          props.className
        )}
        value={value}
        onChange={(e) => setValue((e.target as Element).value)}
      />
    </span>
  );
};

export default forwardRef(Input);
