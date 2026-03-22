import React, { InputHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Input.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, ...props }, ref) => {
    return (
      <div className={clsx(styles.wrapper, className)}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputContainer}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <input
            ref={ref}
            className={clsx(styles.input, { [styles.hasIcon]: !!icon })}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
