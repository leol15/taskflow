import React from 'react';
import clsx from 'clsx';
import styles from './ButtonGroup.module.scss';

interface ButtonGroupProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  colorMap?: Record<string, string>;
}

export function ButtonGroup<T extends string>({ options, value, onChange, className, colorMap }: ButtonGroupProps<T>) {
  return (
    <div className={clsx(styles.buttonGroup, className)}>
      {options.map((option) => {
        const customStyle = colorMap?.[option as string] 
          ? { '--active-color': `var(${colorMap[option as string]})` } as React.CSSProperties 
          : undefined;

        return (
          <button
            key={option}
            type="button"
            className={clsx(styles.choice, { [styles.active]: value === option })}
            style={customStyle}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
