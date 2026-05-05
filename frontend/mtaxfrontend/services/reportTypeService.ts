// services/reportTypeService.ts
import { API_BASE_URL } from "@/api_base_url/page";

export interface Field {
  id: string;
  type: string;
  label: string;
  order: number;
  result?: string | number;
  value?: number;
  isCalculated?: boolean;
  calculationRule?: string;
  children?: Field[];
  defaultValue?: number;
}

export interface Section {
  id: string;
  title: string;
  fields: Field[];
  columns?: Array<{ key: string; header: string }>;
}

export interface ReportSchema {
  sections: Section[];
  version?: number;
  updatedAt?: string;
}

export interface ReportType {
  id: number;
  type_code: string;
  type_name: string;
  field_schema: ReportSchema;
  schema_version: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SchemaChange {
  id: number;
  report_type_id: number;
  old_schema_version: number;
  new_schema_version: number;
  change_summary: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  migrated_reports_count: number;
  created_at: string;
  completed_at: string;
}

export interface MigrationStatus {
  schema_change_id: number;
  report_type_id: number;
  old_schema_version: number;
  new_schema_version: number;
  change_summary: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  migrated_reports_count: number;
  total_reports?: number;
  created_at: string;
  completed_at: string;
}

interface ApiResponse<T> {
  resultCode: number;
  resultMessage: string;
  data: T;
  datasize: number;
  action: string;
  curdate: string;
}

// Debug mode
const DEBUG = true;

const log = (...args: any[]) => {
  if (DEBUG) {
    console.log("[ReportTypeService]", ...args);
  }
};

export const reportTypeService = {
  // API холболт шалгах
  async testApiConnection(): Promise<{ success: boolean; message: string }> {
    try {
      log("Testing API connection to:", API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/api/report-types/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      log("API test response:", data);
      
      return {
        success: data.resultCode === 200,
        message: data.resultMessage || (data.resultCode === 200 ? "Connected" : "Failed")
      };
    } catch (error: any) {
      log("API connection error:", error);
      return {
        success: false,
        message: error.message || "Connection failed"
      };
    }
  },

  // Бүх идэвхтэй тайлангийн төрлүүдийг авах
  async getActiveReportTypes(): Promise<ReportType[]> {
    try {
      log("Fetching active report types...");
      const response = await fetch(`${API_BASE_URL}/api/report-types/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data: ApiResponse<ReportType[]> = await response.json();
      
      log("getActiveReportTypes response:", {
        resultCode: data.resultCode,
        resultMessage: data.resultMessage,
        dataCount: data.data?.length,
        datasize: data.datasize
      });
      
      if (data.resultCode === 200 && data.data) {
        log(`Successfully fetched ${data.data.length} report types`);
        return data.data;
      }
      log("No report types found or error, resultCode:", data.resultCode);
      return [];
    } catch (error) {
      console.error("Error fetching report types:", error);
      return [];
    }
  },

  // ID-ээр тайлангийн төрөл авах
  async getReportTypeById(id: number): Promise<ReportType | null> {
    try {
      log(`Fetching report type with ID: ${id}`);
      const response = await fetch(`${API_BASE_URL}/api/report-types/${id}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data: ApiResponse<ReportType> = await response.json();
      
      log("getReportTypeById response:", {
        id,
        resultCode: data.resultCode,
        resultMessage: data.resultMessage,
        hasData: !!data.data,
        schema_version: data.data?.schema_version
      });
      
      if (data.resultCode === 200 && data.data) {
        log(`Successfully fetched report type: ${data.data.type_name} (ID: ${data.data.id}, v${data.data.schema_version})`);
        return data.data;
      }
      log(`Report type with ID ${id} not found`);
      return null;
    } catch (error) {
      console.error(`Error fetching report type ${id}:`, error);
      return null;
    }
  },

  // Тайлангийн бүтцийг шинэчлэх
  async updateReportSchema(reportTypeId: number, newSchema: ReportSchema): Promise<{
    success: boolean;
    schema_change_id?: number;
    old_version?: number;
    new_version?: number;
    message?: string;
  }> {
    try {
      log(`Updating schema for report type ID: ${reportTypeId}`);
      log("New schema:", newSchema);
      
      const response = await fetch(`${API_BASE_URL}/api/reporttype/updateschema/${reportTypeId}/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ field_schema: newSchema }),
      });
      
      const data = await response.json();
      log("Update schema response:", data);
      
      if (data.resultCode === 8020 && data.data) {
        return {
          success: true,
          schema_change_id: data.data.schema_change_id,
          old_version: data.data.old_version,
          new_version: data.data.new_version,
          message: data.data.message
        };
      }
      
      return {
        success: false,
        message: data.resultMessage || "Schema шинэчлэхэд алдаа гарлаа"
      };
    } catch (error: any) {
      console.error("Error updating schema:", error);
      return {
        success: false,
        message: error.message || "Сервертэй холбогдоход алдаа гарлаа"
      };
    }
  },

  // Migration төлөв шалгах
  async getMigrationStatus(schemaChangeId: number): Promise<MigrationStatus | null> {
    try {
      log(`Getting migration status for change ID: ${schemaChangeId}`);
      const response = await fetch(`${API_BASE_URL}/api/reporttype/migrationstatus/${schemaChangeId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      log("Migration status response:", data);
      
      if (data.resultCode === 8020 && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error getting migration status:", error);
      return null;
    }
  },

  // Schema түүх харах
  async getSchemaHistory(reportTypeId: number): Promise<SchemaChange[]> {
    try {
      log(`Getting schema history for report type ID: ${reportTypeId}`);
      const response = await fetch(`${API_BASE_URL}/api/reporttype/schemahistory/${reportTypeId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      log("Schema history response:", data);
      
      if (data.resultCode === 8020 && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error getting schema history:", error);
      return [];
    }
  },

  // Тайлангийн мэдээлэл болон schema-г хамт авах
  async getReportWithSchema(reportId: number): Promise<{
    report: any;
    reportType: ReportType | null;
  } | null> {
    try {
      log(`========== GET REPORT WITH SCHEMA ==========`);
      log(`Report ID: ${reportId}`);
      log(`API URL: ${API_BASE_URL}/api/report/${reportId}/`);
      
      const reportResponse = await fetch(`${API_BASE_URL}/api/report/${reportId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      
      log(`Report response status: ${reportResponse.status}`);
      
      const reportData: ApiResponse<any> = await reportResponse.json();
      
      log("Report API full response:", JSON.stringify(reportData, null, 2));
      log(`Report resultCode: ${reportData.resultCode}`);
      log(`Report resultMessage: ${reportData.resultMessage}`);
      log(`Has report data: ${!!reportData.data}`);
      
      if (reportData.resultCode === 7520 && reportData.data) {
        const report = reportData.data;
        log("Report data keys:", Object.keys(report));
        log(`Report report_type_id: ${report.report_type_id}`);
        log(`Report schema_version: ${report.schema_version || 1}`);
        log(`Report org_id: ${report.org_id}`);
        log(`Report org_name: ${report.org_name}`);
        
        const reportTypeId = report.report_type_id;
        
        if (reportTypeId) {
          log(`Found report_type_id: ${reportTypeId}, fetching report type...`);
          
          const reportType = await this.getReportTypeById(reportTypeId);
          
          if (reportType) {
            log(`Successfully fetched report type: ${reportType.type_name}`);
            log(`Report type schema_version: ${reportType.schema_version}`);
            log(`Report type field_schema keys:`, reportType.field_schema ? Object.keys(reportType.field_schema) : "null");
            log(`Sections count: ${reportType.field_schema?.sections?.length || 0}`);
          } else {
            log(`Failed to fetch report type with ID: ${reportTypeId}`);
          }
          
          log(`========== END ==========`);
          return { report, reportType };
        } else {
          log(`WARNING: report_type_id is missing in report data!`);
        }
      } else {
        log(`ERROR: Report not found! resultCode: ${reportData.resultCode}, message: ${reportData.resultMessage}`);
      }
      
      log(`========== END WITH ERROR ==========`);
      return null;
    } catch (error: any) {
      console.error("Error fetching report with schema:", error);
      log("Error details:", {
        message: error.message,
        stack: error.stack
      });
      return null;
    }
  },

  // Тайлангийн бүтцийг валидлах
  validateSchema(schema: ReportSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!schema || typeof schema !== 'object') {
      errors.push("Schema нь объект байх ёстой");
      return { valid: false, errors };
    }
    
    if (!schema.sections || !Array.isArray(schema.sections)) {
      errors.push("sections талбар массиваар байх ёстой");
      return { valid: false, errors };
    }
    
    const validateFields = (fields: Field[], path: string): void => {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const fieldPath = `${path}.fields[${i}]`;
        
        if (!field.id) {
          errors.push(`${fieldPath}: id талбар заавал байх ёстой`);
        }
        if (!field.label) {
          errors.push(`${fieldPath}.${field.id || i}: label талбар заавал байх ёстой`);
        }
        if (field.isCalculated && !field.calculationRule) {
          errors.push(`${fieldPath}.${field.id}: Тооцоололтой талбарт calculationRule заавал байх ёстой`);
        }
        if (field.children) {
          validateFields(field.children, `${fieldPath}.children`);
        }
      }
    };
    
    for (let i = 0; i < schema.sections.length; i++) {
      const section = schema.sections[i];
      if (!section.id) {
        errors.push(`sections[${i}]: id талбар заавал байх ёстой`);
      }
      if (!section.title) {
        errors.push(`sections[${i}]: title талбар заавал байх ёстой`);
      }
      if (section.fields && Array.isArray(section.fields)) {
        validateFields(section.fields, `sections[${i}]`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  },

  // Тайлангийн бүтцийн хуулбар үүсгэх
  cloneSchema(schema: ReportSchema): ReportSchema {
    return JSON.parse(JSON.stringify(schema));
  },

  // Migration-ийн дэлгэрэнгүй мэдээлэл авах
  async getMigrationDetails(schemaChangeId: number): Promise<{
    success: boolean;
    logs?: any[];
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reporttype/migrationlogs/${schemaChangeId}/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await response.json();
      
      if (data.resultCode === 8020 && data.data) {
        return {
          success: true,
          logs: data.data
        };
      }
      return {
        success: false,
        message: data.resultMessage || "Мэдээлэл авахад алдаа гарлаа"
      };
    } catch (error: any) {
      console.error("Error getting migration details:", error);
      return {
        success: false,
        message: error.message || "Сервертэй холбогдоход алдаа гарлаа"
      };
    }
  },

  // Шалгах функц - бүх API-г тестлэх
  async testAllApis(reportId?: number): Promise<void> {
    log("\n========== STARTING API TESTS ==========\n");
    
    // Test 1: API connection
    log("Test 1: Testing API connection...");
    const connection = await this.testApiConnection();
    log(`Result: ${connection.success ? '✅ SUCCESS' : '❌ FAILED'} - ${connection.message}`);
    
    // Test 2: Get all report types
    log("\nTest 2: Fetching all report types...");
    const reportTypes = await this.getActiveReportTypes();
    log(`Result: ${reportTypes.length > 0 ? '✅ SUCCESS' : '❌ FAILED'} - Found ${reportTypes.length} report types`);
    if (reportTypes.length > 0) {
      log("Report types:", reportTypes.map(rt => ({ id: rt.id, name: rt.type_name, version: rt.schema_version })));
    }
    
    // Test 3: Get specific report type (id=1)
    log("\nTest 3: Fetching report type with ID=1...");
    const reportType1 = await this.getReportTypeById(1);
    log(`Result: ${reportType1 ? '✅ SUCCESS' : '❌ FAILED'} - ${reportType1?.type_name || 'Not found'} (v${reportType1?.schema_version || 0})`);
    
    // Test 4: Get report with schema (if reportId provided)
    if (reportId) {
      log(`\nTest 4: Fetching report with ID=${reportId}...`);
      const result = await this.getReportWithSchema(reportId);
      log(`Result: ${result ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (result) {
        log(`  - Report ID: ${result.report.report_id || result.report.id}`);
        log(`  - Report Type ID: ${result.report.report_type_id}`);
        log(`  - Report Type Name: ${result.reportType?.type_name || 'N/A'}`);
        log(`  - Report Schema Version: ${result.report.schema_version || 1}`);
        log(`  - Type Schema Version: ${result.reportType?.schema_version || 0}`);
        log(`  - Has field_schema: ${!!result.reportType?.field_schema}`);
      }
    } else {
      log("\nTest 4: Skipped (no reportId provided)");
      log("  To test report fetch, call: reportTypeService.testAllApis(YOUR_REPORT_ID)");
    }
    
    // Test 5: Get schema history
    if (reportTypes[0]) {
      log(`\nTest 5: Getting schema history for report type ID=${reportTypes[0].id}...`);
      const history = await this.getSchemaHistory(reportTypes[0].id);
      log(`Result: ${history.length > 0 ? '✅ SUCCESS' : 'ℹ️ NO HISTORY'} - ${history.length} records found`);
      if (history.length > 0) {
        log("Latest history:", history[0]);
      }
    }
    
    log("\n========== API TESTS COMPLETED ==========\n");
  }
};

// Browser console дээр test хийхэд
// reportTypeService.testAllApis(1)

// Schema өөрчлөх жишээ:
// const newSchema = {
//   sections: [
//     {
//       id: "A",
//       title: "А. Шинэ хэсэг",
//       fields: [
//         { id: "1", type: "number", label: "1. Шинэ талбар", order: 1, isCalculated: false }
//       ]
//     }
//   ]
// };
// reportTypeService.updateReportSchema(1, newSchema).then(result => console.log(result));

// Migration төлөв шалгах:
// reportTypeService.getMigrationStatus(1).then(status => console.log(status));