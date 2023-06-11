import Fuse from "fuse.js";
import {
  HTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

import Caret from "@/ui/caret";

type Option = {
  value: string;
  label: string;
};

interface Props extends HTMLAttributes<HTMLInputElement> {
  value: string;
  setValue: (value: string) => void;
  label?: string;
  options: Array<Option>;
}

const fuseOptions = {
  includeMatches: true,
  shouldSort: true,
  threshold: 0.4,
  location: 0,
  distance: 100,
  keys: ["label", "value"],
};

const SelectSearch = (
  { value, setValue, label, options: options_, ...props }: Props,
  ref: React.Ref<HTMLInputElement>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Array<Option>>(options_);
  const [inputValue, setInputValue] = useState("");

  const wrapperRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.addEventListener("click", (e) => {
      if (wrapperRef.current?.contains(e.target as Node)) {
        return;
      }

      setIsOpen(false);
    });
  }, []);

  useEffect(() => {
    setInputValue(
      options_.find((option) => option.value === value)?.label || value
    );
  }, [value, options_]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) {
        setOptions(options_);
        setValue("");
        return;
      }

      const fuse = new Fuse(options_, fuseOptions);
      const results = fuse.search(e.target.value);
      const newOptions = results.map((result) => result.item);
      setOptions(newOptions);
      setValue(e.target.value);
    },
    [options_, setValue]
  );

  return (
    <span className="relative z-10 flex w-full flex-col" ref={wrapperRef}>
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
        value={inputValue}
        onChange={onChange}
        onFocus={(e) => {
          setIsOpen(true);
          e.target.select();
        }}
      />

      <span
        className="absolute right-0 top-[10px] flex h-full w-10 cursor-pointer items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Caret isOpen={isOpen} />
      </span>

      {isOpen && !!options.length && (
        <div className="absolute top-16 max-h-64 w-full overflow-scroll rounded-xl border border-transparent bg-white py-1 font-mono shadow-lg dark:border-neutral-700 dark:bg-black">
          {options.map((option, index) => (
            <div
              key={index}
              className={twMerge(
                "cursor-pointer px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-800",
                option.value === value ? "bg-gray-200 dark:bg-gray-800" : ""
              )}
              onClick={() => {
                setValue(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </span>
  );
};

export default forwardRef(SelectSearch);
