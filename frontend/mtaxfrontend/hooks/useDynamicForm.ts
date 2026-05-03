// hooks/useDynamicForm.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { reportTypeService, ReportSchema, Field } from "@/services/reportTypeService";

export const parseBackendValue = (result: any): number => {
  if (result === undefined || result === null) return 0;
  if (typeof result === 'number') return isFinite(result) ? result : 0;
  if (typeof result === 'string') {
    if (result.trim() === '') return 0;
    const cleanValue = result.replace(/[₮,\s]/g, '').trim();
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
  let num = parseFloat(cleanValue);
  if (isNaN(num)) return "";
  
  // Round to 2 decimal places immediately
  num = Math.round(num * 100) / 100;
  
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
  const isRecalculatingRef = useRef(false);

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
            const num = parseFloat(initialValues[fieldId]);
            if (!isNaN(num)) {
              const rounded = Math.round(num * 100) / 100;
              newValues[fieldId] = rounded.toString();
            } else {
              newValues[fieldId] = initialValues[fieldId];
            }
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
      const roundedValues: Record<string, string> = {};
      for (const [key, value] of Object.entries(initialValues)) {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          const rounded = Math.round(num * 100) / 100;
          roundedValues[key] = rounded.toString();
        } else {
          roundedValues[key] = value;
        }
      }
      setValues(prev => ({ ...prev, ...roundedValues }));
    }
  }, [schema, initialValues]);

  const evaluateRuleWithValues = useCallback((rule: string | undefined, getValueFn: (id: string) => number): number => {
    if (!rule) return 0;
    
    let expression = rule;
    
    const percentPattern = /(\d+(?:\.\d+)?)%/g;
    const percentPlaceholders: string[] = [];
    expression = expression.replace(percentPattern, (match) => {
      const placeholder = `__PERCENT_${percentPlaceholders.length}__`;
      percentPlaceholders.push(match);
      return placeholder;
    });
    
    const fieldIdPattern = /\b(\d+)\b/g;
    expression = expression.replace(fieldIdPattern, (match) => {
      const value = getValueFn(match);
      return value.toString();
    });
    
    expression = expression.replace(/__PERCENT_(\d+)__/g, (_, index) => {
      const percentMatch = percentPlaceholders[parseInt(index)];
      const percentValue = parseFloat(percentMatch.replace('%', ''));
      const decimalValue = percentValue / 100;
      return decimalValue.toString();
    });
    
    try {
      const result = Function('"use strict"; return (' + expression + ')')();
      const numResult = typeof result === 'number' && !isNaN(result) && isFinite(result) ? result : 0;
      return Math.round(numResult * 100) / 100;
    } catch (error) {
      console.error(`Error evaluating expression "${rule}":`, error);
      return 0;
    }
  }, []);

  const recalculateWithValues = useCallback((currentValues: Record<string, string>): Record<string, string> => {
    if (!schema) return currentValues;
    
    const calculatedFields: Field[] = [];
    
    const collect = (fields: Field[]) => {
      for (const field of fields) {
        if (field.isCalculated && field.calculationRule) calculatedFields.push(field);
        if (field.children?.length) collect(field.children);
      }
    };
    
    collect(schema.sections.flatMap(s => s.fields));
    calculatedFields.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    const updatedValues = { ...currentValues };
    
    const getValueFromCurrent = (fieldId: string): number => {
      const value = updatedValues[fieldId];
      if (!value) return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };
    
    for (let pass = 0; pass < 10; pass++) {
      let changed = false;
      for (const field of calculatedFields) {
        if (field.calculationRule) {
          const result = evaluateRuleWithValues(field.calculationRule, getValueFromCurrent);
          const current = parseFloat(updatedValues[field.id] || "0");
          if (Math.abs(current - result) > 0.001) {
            updatedValues[field.id] = result.toString();
            changed = true;
          }
        }
      }
      if (!changed) break;
    }
    
    return updatedValues;
  }, [schema, evaluateRuleWithValues]);

  // REAL-TIME: Шууд тооцоолол хийх, 2 аравтын оронтой хязгаарлах
  const handleInputChange = useCallback((fieldId: string, displayValue: string) => {
    if (isLocked) return;
    
    // Save the raw display value for showing while typing (without formatting)
    tempInputValueRef.current[fieldId] = displayValue;
    
    // Parse and round to 2 decimal places immediately
    let cleanValue = displayValue.replace(/[₮,]/g, "").trim();
    cleanValue = cleanValue.replace(/[^0-9.-]/g, "");
    
    const dotCount = (cleanValue.match(/\./g) || []).length;
    if (dotCount > 1) {
      const firstDotIndex = cleanValue.indexOf(".");
      cleanValue = cleanValue.substring(0, firstDotIndex + 1) + 
                   cleanValue.substring(firstDotIndex + 1).replace(/\./g, "");
    }
    
    let num = parseFloat(cleanValue);
    let roundedStr = "";
    
    if (!isNaN(num)) {
      const rounded = Math.round(num * 100) / 100;
      roundedStr = rounded.toString();
    } else {
      roundedStr = "";
    }
    
    setValues(prev => {
      const newValues = { ...prev, [fieldId]: roundedStr };
      
      if (!schema || isRecalculatingRef.current) return newValues;
      
      isRecalculatingRef.current = true;
      const updatedValues = recalculateWithValues(newValues);
      isRecalculatingRef.current = false;
      
      return updatedValues;
    });
  }, [isLocked, schema, recalculateWithValues]);

  const handleFocus = useCallback((fieldId: string, field?: Field) => {
    if (isLocked || field?.isCalculated) return;
    inputFocusRef.current[fieldId] = true;
    // Show the raw number without formatting when focused
    const rawValue = values[fieldId];
    if (rawValue && rawValue !== "") {
      const num = parseFloat(rawValue);
      if (!isNaN(num)) {
        // Show as is (could be like "0.01")
        tempInputValueRef.current[fieldId] = num.toString();
      } else {
        tempInputValueRef.current[fieldId] = "";
      }
    } else {
      tempInputValueRef.current[fieldId] = "";
    }
  }, [isLocked, values]);

  const handleBlur = useCallback((fieldId: string) => {
    inputFocusRef.current[fieldId] = false;
    
    // On blur, ensure value is properly rounded to 2 decimal places
    setValues(prev => {
      const currentValue = prev[fieldId];
      if (!currentValue || currentValue === "") return prev;
      
      const num = parseFloat(currentValue);
      if (isNaN(num)) return prev;
      
      const rounded = Math.round(num * 100) / 100;
      const roundedStr = rounded.toString();
      
      if (currentValue !== roundedStr) {
        const newValues = { ...prev, [fieldId]: roundedStr };
        if (schema && !isRecalculatingRef.current) {
          isRecalculatingRef.current = true;
          const updatedValues = recalculateWithValues(newValues);
          isRecalculatingRef.current = false;
          return updatedValues;
        }
        return newValues;
      }
      return prev;
    });
    
    // Clear temp value after blur
    delete tempInputValueRef.current[fieldId];
  }, [schema, recalculateWithValues]);

  const getDisplayValue = useCallback((fieldId: string): string => {
    // When focused, show raw value from tempInputValueRef
    if (inputFocusRef.current[fieldId] && tempInputValueRef.current[fieldId] !== undefined) {
      return tempInputValueRef.current[fieldId];
    }
    // When not focused, show formatted money with 2 decimal places
    const value = values[fieldId];
    if (!value || value === "") return "0.00 ₮";
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00 ₮";
    return formatAsMoney(num);
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
    
    const updatedValues = recalculateWithValues(newValues);
    setValues(updatedValues);
  }, [schema, isLocked, recalculateWithValues]);

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
    
    const updatedValues = recalculateWithValues(clearedValues);
    setValues(updatedValues);
    setIsLocked(true);
  }, [schema, recalculateWithValues]);

  const unlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  const recalculateAll = useCallback(() => {
    if (!schema || isRecalculatingRef.current) return;
    
    isRecalculatingRef.current = true;
    setValues(prev => {
      const updated = recalculateWithValues(prev);
      isRecalculatingRef.current = false;
      return updated;
    });
  }, [schema, recalculateWithValues]);

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
    if (!reportData) return {};
    
    const extractedValues: Record<string, string> = {};
    
    const getNumberValue = (val: any): string => {
      if (val === undefined || val === null) return "0";
      if (typeof val === 'number') {
        const rounded = Math.round(val * 100) / 100;
        return rounded.toString();
      }
      if (typeof val === 'string') {
        const num = parseBackendValue(val);
        const rounded = Math.round(num * 100) / 100;
        return rounded.toString();
      }
      return "0";
    };
    
    if (typeof reportData === "object" && !reportData.sections && !reportData.fields) {
      for (const [key, value] of Object.entries(reportData)) {
        if (typeof value === "string" || typeof value === "number") {
          extractedValues[key] = getNumberValue(value);
        }
      }
      return extractedValues;
    }
    
    if (typeof reportData === "object" && reportData.sections) {
      const extractFromFields = (fields: any[]) => {
        for (const field of fields) {
          if (field.id) {
            let rawValue = null;
            if (field.result !== undefined && field.result !== null) {
              rawValue = field.result;
            } else if (field.value !== undefined && field.value !== null) {
              rawValue = field.value;
            }
            if (rawValue !== null) {
              extractedValues[field.id] = getNumberValue(rawValue);
            }
          }
          if (field.children?.length) extractFromFields(field.children);
        }
      };
      for (const section of reportData.sections) {
        if (section.fields) extractFromFields(section.fields);
      }
      return extractedValues;
    }
    
    if (typeof reportData === "object" && reportData.fields) {
      const extractFromFields = (fields: any[]) => {
        for (const field of fields) {
          if (field.id) {
            let rawValue = null;
            if (field.result !== undefined && field.result !== null) {
              rawValue = field.result;
            } else if (field.value !== undefined && field.value !== null) {
              rawValue = field.value;
            }
            if (rawValue !== null) {
              extractedValues[field.id] = getNumberValue(rawValue);
            }
          }
          if (field.children?.length) extractFromFields(field.children);
        }
      };
      extractFromFields(reportData.fields);
      return extractedValues;
    }
    
    if (typeof reportData === "string") {
      try {
        const parsed = JSON.parse(reportData);
        return extractValuesFromReportData(parsed);
      } catch (e) {
        console.error("JSON parse error:", e);
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