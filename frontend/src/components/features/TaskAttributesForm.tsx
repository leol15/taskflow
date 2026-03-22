import React from "react";
import clsx from "clsx";
import { Category, Importance, Effort, Urgency } from "../../types/task";
import { ButtonGroup } from "../ui/ButtonGroup";
import {
  CATEGORIES,
  IMPORTANCES,
  EFFORTS,
  URGENCIES,
  CATEGORY_COLORS,
  IMPORTANCE_COLORS,
  EFFORT_COLORS,
  URGENCY_COLORS,
} from "../../utils/constants";
import styles from "./TaskAttributesForm.module.scss";

interface TaskAttributesFormProps {
  category: Category;
  setCategory: (c: Category) => void;
  importance: Importance;
  setImportance: (i: Importance) => void;
  effort: Effort;
  setEffort: (e: Effort) => void;
  urgency: Urgency;
  setUrgency: (u: Urgency) => void;
  className?: string;
}

export function TaskAttributesForm({
  category,
  setCategory,
  importance,
  setImportance,
  effort,
  setEffort,
  urgency,
  setUrgency,
  className,
}: TaskAttributesFormProps) {
  return (
    <div className={clsx(styles.attributes, className)}>
      <div className={styles.attributeGroup}>
        <label>Category</label>
        <ButtonGroup options={CATEGORIES} value={category} onChange={setCategory} colorMap={CATEGORY_COLORS} />
      </div>
      <div className={styles.attributeGroup}>
        <label>Importance</label>
        <ButtonGroup options={IMPORTANCES} value={importance} onChange={setImportance} colorMap={IMPORTANCE_COLORS} />
      </div>
      <div className={styles.attributeGroup}>
        <label>Effort</label>
        <ButtonGroup options={EFFORTS} value={effort} onChange={setEffort} colorMap={EFFORT_COLORS} />
      </div>
      <div className={styles.attributeGroup}>
        <label>Urgency</label>
        <ButtonGroup options={URGENCIES} value={urgency} onChange={setUrgency} colorMap={URGENCY_COLORS} />
      </div>
    </div>
  );
}
