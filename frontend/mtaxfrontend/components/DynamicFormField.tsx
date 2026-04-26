// components/DynamicFormField.tsx
import React, { memo } from "react";
import { Field, useDynamicForm } from "@/hooks/useDynamicForm";

interface DynamicFormFieldProps {
  field: Field;
  level: number;
  formHook: ReturnType<typeof useDynamicForm>;
  isLocked: boolean;
}

const DynamicFormFieldComponent: React.FC<DynamicFormFieldProps> = ({ 
  field, 
  level, 
  formHook,
  isLocked 
}) => {
  const { getDisplayValue, handleFocus, handleBlur, handleInputChange } = formHook;
  const canEdit = !field.isCalculated && !isLocked;
  
  return (
    <div key={field.id}>
      <div className={`grid grid-cols-12 gap-4 p-3 ${field.isCalculated ? "bg-blue-50" : ""} border-b border-gray-200`}>
        <div className="col-span-1 font-medium text-gray-800 text-center">{field.id}</div>
        <div className="col-span-8">
          <div className="text-sm text-gray-800" style={{ paddingLeft: `${level * 20}px` }}>
            {field.label}
            {field.isCalculated && field.calculationRule && (
              <span className="ml-2 text-xs text-blue-700">(Томьёо: {field.calculationRule})</span>
            )}
          </div>
        </div>
        <div className="col-span-3">
          <input
            type="text"
            inputMode="decimal"
            value={getDisplayValue(field.id)}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            onFocus={() => handleFocus(field.id, field)}
            onBlur={() => handleBlur(field.id)}
            readOnly={!canEdit}
            placeholder="0.00 ₮"
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-right text-gray-800 font-normal ${
              field.isCalculated ? "bg-blue-100/50 font-medium cursor-not-allowed" :
              !canEdit ? "bg-gray-100 cursor-not-allowed text-gray-600" :
              "bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            }`}
          />
        </div>
      </div>
      {field.children && field.children.map(child => (
        <DynamicFormFieldComponent
          key={child.id}
          field={child}
          level={level + 1}
          formHook={formHook}
          isLocked={isLocked}
        />
      ))}
    </div>
  );
};

export const DynamicFormField = memo(DynamicFormFieldComponent);