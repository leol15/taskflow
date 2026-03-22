import React from 'react';
import clsx from 'clsx';
import styles from './ButtonGroup.module.scss';

interface ButtonGroupProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function ButtonGroup<T extends string>({ options, value, onChange, className }: ButtonGroupProps<T>) {
  return (
    <div className={clsx(styles.buttonGroup, className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={clsx(styles.choice, { [styles.active]: value === option })}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
