import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
}

const Portal = ({ children }: Props) => {
  const element = useRef(document.createElement("div"));

  useEffect(() => {
    const current = element.current;

    document.body.appendChild(current);
    return () => {
      document.body.removeChild(current);
    };
  }, []);

  return createPortal(children, element.current);
};

export default Portal;
