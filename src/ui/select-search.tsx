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
  keys: ["label"],
};

const SelectSearch = (
  { value, setValue, label, options: options_, ...props }: Props,
  ref: React.Ref<HTMLInputElement>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Array<Option>>(options_);
  const [inputValue, setInputValue] = useState("");
  const [menuIndex, setMenuIndex] = useState(0);

  const wrapperRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // close menu when clicked outside
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
    setMenuIndex(0);
  }, [value, options_]);

  useEffect(() => {
    if (!isOpen) setOptions(options_);
  }, [isOpen, options_]);

  const scrollIntoView = useCallback((index: number) => {
    // scroll if out of view
    const menu = optionsRef.current;
    const menuItems = menu?.children;
    const menuItem = menuItems?.[index] as HTMLDivElement;
    if (menuItem) {
      const menuItemRect = menuItem.getBoundingClientRect();
      const menuRect = menu?.getBoundingClientRect();
      if (!menuRect) return;

      if (menuItemRect.bottom + 20 > menuRect.bottom) {
        menu?.scrollBy({
          top: menuItemRect.bottom - menuRect.bottom + 20,
          behavior: "smooth",
        });
      } else if (menuItemRect.top < menuRect.top) {
        menu?.scrollBy({
          top: menuItemRect.top - menuRect.top - 20,
          behavior: "smooth",
        });
      }
    }
  }, []);

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      setIsOpen(true);
      if (e.key === "ArrowDown") {
        const newIndex = (menuIndex + 1) % options.length;
        e.preventDefault();
        setMenuIndex(newIndex);
        scrollIntoView(newIndex);
      } else if (e.key === "ArrowUp") {
        const newIndex = (menuIndex - 1 + options.length) % options.length;
        e.preventDefault();
        setMenuIndex(newIndex);
        scrollIntoView(newIndex);
      } else if (e.key === "Enter") {
        e.preventDefault();
        setValue(options[menuIndex].value);
        setIsOpen(false);
        return;
      } else if (e.key === "Escape" || e.key === "Tab") {
        setIsOpen(false);
        return;
      }
    },
    [options, menuIndex, setValue, scrollIntoView]
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
          "text-md h-12 rounded-xl border border-transparent bg-white px-4 font-mono outline-none drop-shadow dark:border-neutral-700 dark:bg-black",
          props.className
        )}
        value={inputValue}
        onChange={onChange}
        onFocus={(e) => {
          setIsOpen(true);
          e.target.select();
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        onClick={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      <span
        className="absolute right-0 top-[10px] flex h-full w-10 cursor-pointer items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Caret isOpen={isOpen} />
      </span>

      {isOpen && !!options.length && (
        <div
          className="absolute top-16 max-h-64 w-full overflow-scroll rounded-xl border border-transparent bg-white py-1 font-mono shadow-lg dark:border-neutral-700 dark:bg-black"
          ref={optionsRef}
          tabIndex={-1}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className={twMerge(
                "cursor-pointer px-4 py-2",
                option.value === value ? "bg-gray-200 dark:bg-gray-800" : "",
                index === menuIndex ? "bg-gray-200 dark:bg-gray-800" : ""
              )}
              onClick={() => {
                setValue(option.value);
                setIsOpen(false);
              }}
              onMouseMove={() => setMenuIndex(index)}
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
