import type { TextareaHTMLAttributes } from "react";

export type TextFieldProps = {
  id: string;
  label: string;
  containerClassName?: string;
  textareaClassName?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

export default function TextField({
  id,
  label,
  containerClassName,
  textareaClassName,
  ...textareaProps
}: TextFieldProps) {
  return (
    <div className={"flex flex-col gap-1" + (containerClassName ? ` ${containerClassName}` : "")}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        className={
          "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:focus:ring-white/20" +
          (textareaClassName ? ` ${textareaClassName}` : "")
        }
        {...textareaProps}
      />
    </div>
  );
}
