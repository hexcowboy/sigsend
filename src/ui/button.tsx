import { HTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  text: string;
}

const Button = (
  { text, ...props }: Props,
  ref: React.Ref<HTMLButtonElement>
) => {
  return (
    <button
      {...props}
      ref={ref}
      className={twMerge(
        "rounded-xl bg-black px-4 py-2 text-lg font-bold text-white dark:bg-white dark:text-black",
        props.className
      )}
    >
      {text}
    </button>
  );
};

export default forwardRef(Button);
