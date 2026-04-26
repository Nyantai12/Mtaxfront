// components/DynamicForm.tsx
import React from "react";
import { useDynamicForm } from "@/app/hooks/useDynamicForm";
import { DynamicFormField } from "./DynamicFormField";

type Section = NonNullable<ReturnType<typeof useDynamicForm>['schema']>['sections'][number];

interface DynamicFormProps {
  formHook: ReturnType<typeof useDynamicForm>;
  isLocked: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ formHook, isLocked }) => {
  const { schema } = formHook;
  
  if (!schema || !schema.sections) {
    return (
      <div className="text-center py-8 text-gray-500">
        Маягтын бүтэц олдсонгүй
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {schema.sections.map((section: Section) => (
        <div key={section.id} className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] px-6 py-4">
            <h2 className="text-lg font-bold text-white">{section.title}</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-12 gap-4 px-3 py-2 bg-gray-100 rounded-t-lg font-medium text-sm text-gray-700">
              <div className="col-span-1">Мөр</div>
              <div className="col-span-8">Үзүүлэлтүүд</div>
              <div className="col-span-3">Дүн (₮)</div>
            </div>
            <div className="border-x border-b rounded-b-lg">
              {section.fields.map(field => (
                <DynamicFormField
                  key={field.id}
                  field={field}
                  level={0}
                  formHook={formHook}
                  isLocked={isLocked}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};