import type { InputHTMLAttributes } from "react";

export type InputFieldProps = {
  id: string;
  label: string;
  containerClassName?: string;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

export default function InputField({
  id,
  label,
  containerClassName,
  inputClassName,
  ...inputProps
}: InputFieldProps) {
  return (
    <div className={"flex flex-col gap-1" + (containerClassName ? ` ${containerClassName}` : "")}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className={
          "h-10 rounded-md border border-black/10 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:border-white/10 dark:focus:ring-white/20" +
          (inputClassName ? ` ${inputClassName}` : "")
        }
        {...inputProps}
      />
    </div>
  );
}
