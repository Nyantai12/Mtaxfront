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
}

export interface Section {
  id: string;
  title: string;
  fields: Field[];
  columns?: Array<{ key: string; header: string }>;
}

export interface ReportSchema {
  sections: Section[];
}

export interface ReportType {
  id: number;
  type_code: string;
  type_name: string;
  field_schema: ReportSchema;
  is_active: boolean;
}

interface ApiResponse<T> {
  resultCode: number;
  resultMessage: string;
  data: T;
  datasize: number;
  action: string;
  curdate: string;
}

// Debug mode - үүнийг true болгоод шалгана уу
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
        hasData: !!data.data
      });
      
      if (data.resultCode === 200 && data.data) {
        log(`Successfully fetched report type: ${data.data.type_name} (ID: ${data.data.id})`);
        return data.data;
      }
      log(`Report type with ID ${id} not found`);
      return null;
    } catch (error) {
      console.error(`Error fetching report type ${id}:`, error);
      return null;
    }
  },

  async getReportWithSchema(reportId: number): Promise<{
    report: any;
    reportType: ReportType | null;
  } | null> {
    try {
      log(`========== GET REPORT WITH SCHEMA ==========`);
      log(`Report ID: ${reportId}`);
      log(`API URL: ${API_BASE_URL}/api/report/${reportId}/`);
      
      // Step 1: Fetch report
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
        log(`Report org_id: ${report.org_id}`);
        log(`Report org_name: ${report.org_name}`);
        
        const reportTypeId = report.report_type_id;
        
        if (reportTypeId) {
          log(`Found report_type_id: ${reportTypeId}, fetching report type...`);
          
          // Step 2: Fetch report type
          const reportType = await this.getReportTypeById(reportTypeId);
          
          if (reportType) {
            log(`Successfully fetched report type: ${reportType.type_name}`);
            log(`Report type field_schema keys:`, reportType.field_schema ? Object.keys(reportType.field_schema) : "null");
            log(`Sections count: ${reportType.field_schema?.sections?.length || 0}`);
          } else {
            log(`Failed to fetch report type with ID: ${reportTypeId}`);
          }
          
          log(`========== END ==========`);
          return { report, reportType };
        } else {
          log(`WARNING: report_type_id is missing in report data!`);
          log(`Report data:`, report);
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
      log("Report types:", reportTypes.map(rt => ({ id: rt.id, name: rt.type_name })));
    }
    
    // Test 3: Get specific report type (id=1)
    log("\nTest 3: Fetching report type with ID=1...");
    const reportType1 = await this.getReportTypeById(1);
    log(`Result: ${reportType1 ? '✅ SUCCESS' : '❌ FAILED'} - ${reportType1?.type_name || 'Not found'}`);
    
    // Test 4: Get report with schema (if reportId provided)
    if (reportId) {
      log(`\nTest 4: Fetching report with ID=${reportId}...`);
      const result = await this.getReportWithSchema(reportId);
      log(`Result: ${result ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (result) {
        log(`  - Report ID: ${result.report.report_id || result.report.id}`);
        log(`  - Report Type ID: ${result.report.report_type_id}`);
        log(`  - Report Type Name: ${result.reportType?.type_name || 'N/A'}`);
        log(`  - Has field_schema: ${!!result.reportType?.field_schema}`);
      }
    } else {
      log("\nTest 4: Skipped (no reportId provided)");
      log("  To test report fetch, call: reportTypeService.testAllApis(YOUR_REPORT_ID)");
    }
    
    log("\n========== API TESTS COMPLETED ==========\n");
  }
};

// Browser console дээр test хийхэд
// reportTypeService.testAllApis(1)