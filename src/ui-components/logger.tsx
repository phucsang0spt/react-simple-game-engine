import { useCallback, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { getClassname, toText } from "../utils";

export function Logger() {
  const [messages, setMessages] = useState<string[]>([]);
  const refList = useRef<HTMLDivElement>(null);

  const container = useMemo(() => {
    const c = document.createElement("div");
    c.className = getClassname("game-logger");
    document.body.appendChild(c);
    return c;
  }, []);

  const pushMessage = useCallback((args: any[]) => {
    setMessages((prev) => [
      ...prev,
      args
        .map((arg) => {
          return arg && typeof arg === "object"
            ? toText(arg)
            : arg === null
            ? "null"
            : arg === undefined
            ? "undefined"
            : arg;
        })
        .join(", "),
    ]);
    if (refList.current) {
      refList.current.scrollTop = refList.current.scrollHeight;
    }
  }, []);

  useMemo(() => {
    const originLog = console.log.bind(console);
    console.log = (...args) => {
      originLog(...args);
      pushMessage(args);
    };
    const originError = console.error.bind(console);
    console.error = (...args) => {
      originError(...args);
      pushMessage(args);
    };
    const originWarn = console.warn.bind(console);
    console.warn = (...args) => {
      originWarn(...args);
      pushMessage(args);
    };
    const originInfo = console.info.bind(console);
    console.info = (...args) => {
      originInfo(...args);
      pushMessage(args);
    };
  }, [pushMessage]);

  return ReactDOM.createPortal(
    messages.length ? (
      <div className={getClassname("message-stack")}>
        <div className={getClassname("message-stack-heading")}>
          <p onClick={() => setMessages([])}>X Clear</p>
        </div>
        <div className={getClassname("message-stack-content")} ref={refList}>
          {messages.map((mss, i) => (
            <p key={i}>- {mss}</p>
          ))}
        </div>
      </div>
    ) : null,
    container
  );
}
