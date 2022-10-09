import {
  useMemo,
  useEffect,
  useState,
  useCallback,
  ReactElement,
  forwardRef,
  cloneElement,
  useImperativeHandle,
  useRef,
  CSSProperties,
  memo,
} from "react";
import * as ReactDOM from "react-dom";
import { getClassName } from "../utils";

type ModalProps = {
  children?: ReactElement;
  content: ReactElement;
  backgroundStyle?: CSSProperties;
  defaultOpen?: boolean;
  event?: string;
  onClose?: () => void;
};

export type RefModalFunctions = {
  open: () => void;
  close: () => void;
};

export const Modal = forwardRef<RefModalFunctions, ModalProps>(function (
  {
    backgroundStyle,
    children: trigger,
    content,
    defaultOpen = false,
    onClose,
    event = "onClick",
  },
  ref
) {
  const [isOpen, setOpen] = useState(defaultOpen);

  const container = useMemo(() => {
    const c = document.createElement("div");
    c.className = getClassName("game-modal");
    return c;
  }, []);

  useEffect(() => {
    const stack = document.getElementById("scene-modal-stack");
    stack.appendChild(container);
    return () => {
      stack.removeChild(container);
    };
  }, [container]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);

  useImperativeHandle(
    ref,
    () => ({
      open: handleOpen,
      close: handleClose,
    }),
    [handleOpen, handleClose]
  );

  return (
    <>
      {trigger
        ? cloneElement(
            trigger,
            {
              [event]: handleOpen,
            },
            trigger.props.children
          )
        : null}

      {ReactDOM.createPortal(
        isOpen ? (
          <ModalWrap
            content={content}
            backgroundStyle={backgroundStyle}
            handleClose={handleClose}
          />
        ) : null,
        container
      )}
    </>
  );
});

type Props = {
  content: ReactElement;
  backgroundStyle?: CSSProperties;
  handleClose: () => void;
};

const ModalWrap = memo(function ({
  content,
  backgroundStyle,
  handleClose,
}: Props) {
  const refModal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickClose = function () {
      setTimeout(() => {
        handleClose();
      }, 0);
    };

    const buttons = refModal.current!.querySelectorAll('[data-role="close"]');

    for (const btn of Array.from(buttons)) {
      btn.addEventListener("click", handleClickClose);
    }

    return () => {
      for (const btn of Array.from(buttons)) {
        btn.removeEventListener("click", handleClickClose);
      }
    };
  }, [handleClose]);

  const el = useMemo(() => {
    return cloneElement(
      content,
      {
        close: handleClose,
      },
      content.props.children
    );
  }, [content]);

  return (
    <div className={getClassName("modal-content-wrap")}>
      <div className={getClassName("modal-content-centered")} ref={refModal}>
        <div
          className={getClassName("modal-content-closer")}
          style={{
            ...backgroundStyle,
          }}
          onClick={handleClose}
        />
        <main className={getClassName("modal-content-main")}>{el}</main>
      </div>
    </div>
  );
});
