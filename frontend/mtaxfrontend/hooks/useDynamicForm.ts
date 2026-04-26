// hooks/useDynamicForm.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { reportTypeService, ReportSchema, Field } from "@/services/reportTypeService";

export const parseBackendValue = (result: any): number => {
  if (result === undefined || result === null) return 0;
  if (typeof result === 'number') return isFinite(result) ? result : 0;
  if (typeof result === 'string') {
    if (result.trim() === '') return 0;
    const cleanValue = result.replace(/[₮,]/g, '').trim();
    if (cleanValue === '') return 0;
    const parsed = parseFloat(cleanValue);
    return !isNaN(parsed) && isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const formatAsMoney = (value: string | number): string => {
  if (value === "" || value === undefined || value === null) return "0.00 ₮";
  let num: number;
  if (typeof value === 'string') {
    const cleanValue = value.replace(/[₮,]/g, '').trim();
    num = parseFloat(cleanValue);
  } else {
    num = value;
  }
  if (isNaN(num) || !isFinite(num)) return "0.00 ₮";
  const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formatted} ₮`;
};

export const parseInputValue = (value: string): string => {
  if (!value) return "";
  let cleanValue = value.replace(/[₮,]/g, "").trim();
  cleanValue = cleanValue.replace(/[^0-9.-]/g, "");
  const dotCount = (cleanValue.match(/\./g) || []).length;
  if (dotCount > 1) {
    const firstDotIndex = cleanValue.indexOf(".");
    cleanValue = cleanValue.substring(0, firstDotIndex + 1) + 
                 cleanValue.substring(firstDotIndex + 1).replace(/\./g, "");
  }
  const num = parseFloat(cleanValue);
  if (isNaN(num)) return "";
  return num.toString();
};

interface UseDynamicFormProps {
  reportTypeId?: number;
  initialValues?: Record<string, string>;
  autoLoad?: boolean;
}

export const useDynamicForm = ({
  reportTypeId,
  initialValues,
  autoLoad = true
}: UseDynamicFormProps = {}) => {
  const [schema, setSchema] = useState<ReportSchema | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputFocusRef = useRef<{ [key: string]: boolean }>({});
  const tempInputValueRef = useRef<{ [key: string]: string }>({});
  const recalculateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAllFieldIds = useCallback((fields?: Field[]): string[] => {
    if (!fields) return [];
    let ids: string[] = [];
    for (const field of fields) {
      ids.push(field.id);
      if (field.children?.length) {
        ids = [...ids, ...getAllFieldIds(field.children)];
      }
    }
    return ids;
  }, []);

  const loadSchema = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const reportType = await reportTypeService.getReportTypeById(id);
      if (reportType?.field_schema) {
        setSchema(reportType.field_schema);
        
        const allIds = getAllFieldIds(reportType.field_schema.sections.flatMap(s => s.fields));
        const newValues: Record<string, string> = {};
        
        for (const fieldId of allIds) {
          if (initialValues && initialValues[fieldId] !== undefined) {
            newValues[fieldId] = initialValues[fieldId];
          } else {
            newValues[fieldId] = "";
          }
        }
        setValues(newValues);
      } else {
        setError("Тайлангийн маягтын бүтэц олдсонгүй");
      }
    } catch (err) {
      setError("Маягтын бүтэц ачаалахад алдаа гарлаа");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [initialValues, getAllFieldIds]);

  useEffect(() => {
    if (autoLoad && reportTypeId) {
      loadSchema(reportTypeId);
    }
  }, [reportTypeId, autoLoad, loadSchema]);

  useEffect(() => {
    if (schema && initialValues && Object.keys(initialValues).length > 0) {
      setValues(prev => ({ ...prev, ...initialValues }));
      setTimeout(() => recalculateAll(), 100);
    }
  }, [schema, initialValues]);

  const getValue = useCallback((fieldId: string): number => {
    const value = values[fieldId];
    if (!value) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }, [values]);

  const evaluateRule = useCallback((rule?: string): number => {
    if (!rule) return 0;
    let expression = rule.replace(/(\d+(?:\.\d+)?)%/g, (_, p1) => `(${parseFloat(p1) / 100})`);
    expression = expression.replace(/\b(\d+)\b/g, (match) => getValue(match).toString());
    try {
      const result = Function('"use strict"; return (' + expression + ')')();
      return isNaN(result) ? 0 : result;
    } catch { 
      return 0; 
    }
  }, [getValue]);

  const recalculateAll = useCallback(() => {
    if (!schema) return;
    
    setValues(prev => {
      const newValues = { ...prev };
      const calculatedFields: Field[] = [];
      
      const collect = (fields: Field[]) => {
        for (const field of fields) {
          if (field.isCalculated && field.calculationRule) calculatedFields.push(field);
          if (field.children?.length) collect(field.children);
        }
      };
      
      collect(schema.sections.flatMap(s => s.fields));
      
      for (let i = 0; i < 10; i++) {
        let changed = false;
        for (const field of calculatedFields) {
          if (field.calculationRule) {
            const result = evaluateRule(field.calculationRule);
            const current = parseFloat(newValues[field.id] || "0");
            if (Math.abs(current - result) > 0.001) {
              newValues[field.id] = result.toString();
              changed = true;
            }
          }
        }
        if (!changed) break;
      }
      return newValues;
    });
  }, [schema, evaluateRule]);

  const handleFocus = useCallback((fieldId: string, field?: Field) => {
    if (isLocked || field?.isCalculated) return;
    inputFocusRef.current[fieldId] = true;
    tempInputValueRef.current[fieldId] = "";
  }, [isLocked]);

  const handleBlur = useCallback((fieldId: string) => {
    inputFocusRef.current[fieldId] = false;
    delete tempInputValueRef.current[fieldId];
    setTimeout(() => recalculateAll(), 50);
  }, [recalculateAll]);

  const handleInputChange = useCallback((fieldId: string, displayValue: string) => {
    if (isLocked) return;
    tempInputValueRef.current[fieldId] = displayValue;
    const cleanValue = parseInputValue(displayValue);
    setValues(prev => ({ ...prev, [fieldId]: cleanValue }));
    if (recalculateTimeoutRef.current) clearTimeout(recalculateTimeoutRef.current);
    recalculateTimeoutRef.current = setTimeout(() => recalculateAll(), 100);
  }, [isLocked, recalculateAll]);

  const getDisplayValue = useCallback((fieldId: string): string => {
    if (inputFocusRef.current[fieldId] && tempInputValueRef.current[fieldId] !== undefined) {
      return tempInputValueRef.current[fieldId];
    }
    const value = values[fieldId];
    if (!value) return "0.00 ₮";
    const num = parseFloat(value);
    return isNaN(num) ? "0.00 ₮" : formatAsMoney(num);
  }, [values]);

  const resetValues = useCallback(() => {
    if (!schema || isLocked) return;
    const newValues: Record<string, string> = {};
    const resetFields = (fields: Field[]) => {
      for (const field of fields) {
        if (!field.isCalculated) newValues[field.id] = "0";
        if (field.children?.length) resetFields(field.children);
      }
    };
    resetFields(schema.sections.flatMap(s => s.fields));
    setValues(newValues);
    setTimeout(() => recalculateAll(), 0);
  }, [schema, isLocked, recalculateAll]);

  const clearAndLock = useCallback(() => {
    if (!schema) return;
    const clearedValues: Record<string, string> = {};
    const collectAllFieldIds = (fields: Field[]) => {
      for (const field of fields) {
        clearedValues[field.id] = "0";
        if (field.children?.length) collectAllFieldIds(field.children);
      }
    };
    collectAllFieldIds(schema.sections.flatMap(s => s.fields));
    setValues(clearedValues);
    setIsLocked(true);
  }, [schema]);

  const unlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  const buildReportData = useCallback(() => {
    if (!schema) return null;
    
    const buildFieldsWithValues = (fields: Field[]): any[] => {
      return fields.map(field => {
        const result = values[field.id];
        const num = parseFloat(result || "0");
        
        return {
          id: field.id,
          type: field.type,
          label: field.label,
          order: field.order,
          isCalculated: field.isCalculated,
          calculationRule: field.calculationRule,
          result: formatAsMoney(isNaN(num) ? 0 : num),
          children: field.children?.length ? buildFieldsWithValues(field.children) : undefined
        };
      });
    };
    
    return {
      sections: schema.sections.map(section => ({
        id: section.id,
        title: section.title,
        fields: buildFieldsWithValues(section.fields)
      }))
    };
  }, [schema, values]);

  const extractValuesFromReportData = useCallback((reportData: any): Record<string, string> => {
    const extractedValues: Record<string, string> = {};
    
    const extractFromFields = (fields: any[]) => {
      for (const field of fields) {
        if (field.id) {
          if (field.result !== undefined && field.result !== null) {
            extractedValues[field.id] = parseBackendValue(field.result).toString();
          } else if (field.value !== undefined && field.value !== null) {
            extractedValues[field.id] = field.value.toString();
          }
        }
        if (field.children?.length) extractFromFields(field.children);
      }
    };
    
    if (reportData?.sections) {
      for (const section of reportData.sections) {
        if (section.fields) extractFromFields(section.fields);
      }
    }
    
    return extractedValues;
  }, []);

  return {
    schema,
    values,
    setValues,
    isLocked,
    setIsLocked,
    isLoading,
    error,
    loadSchema,
    getValue,
    getDisplayValue,
    handleFocus,
    handleBlur,
    handleInputChange,
    resetValues,
    clearAndLock,
    unlock,
    recalculateAll,
    buildReportData,
    extractValuesFromReportData,
    getAllFieldIds: () => getAllFieldIds(schema?.sections.flatMap(s => s.fields)),
  };
};

export type { Field };
