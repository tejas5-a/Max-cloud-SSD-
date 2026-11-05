import type { CloudFile, StorageQuota } from '../types';

/**
 * TeraBox Feasibility Assessment Report & Provider Architecture Stub
 *
 * Evaluation Summary:
 * 1. Official API Status: As of 2025/2026, TeraBox (Flextech Inc. / Baidu Japan) provides enterprise
 *    B2B partner integrations on invitation, but does NOT provide an open public OAuth 2.0 REST API
 *    or developer portal for personal cloud drive access by third-party desktop client applications.
 * 2. Security & Compliance: TeraBox Terms of Service prohibit credential scraping, headless browser automation,
 *    and reverse-engineering undocumented private endpoints.
 * 3. Architecture Action: In strict compliance with security engineering standards and the Master Development Prompt,
 *    no private APIs or password scraping are used. The provider interface is prepared with clean stubs ready to activate
 *    the moment TeraBox publishes an authorized public personal drive API.
 */

export const TERABOX_UNSUPPORTED_MESSAGE =
  'TeraBox integration is not currently supported. Connect it when an authorized API becomes available.';

export interface TeraBoxAuditReport {
  apiStatus: 'unavailable_public_personal_api';
  officialDeveloperPortal: string;
  authenticationRequirement: 'OAuth 2.0 PKCE (Pending official release)';
  termsOfServiceCompliance: 'Compliant - No scraping or unauthorized reverse engineering';
  recommendedAction: string;
  lastAudited: string;
}

export const TERABOX_AUDIT_REPORT: TeraBoxAuditReport = {
  apiStatus: 'unavailable_public_personal_api',
  officialDeveloperPortal: 'https://www.terabox.com (No public 3rd-party personal developer program)',
  authenticationRequirement: 'OAuth 2.0 PKCE (Pending official release)',
  termsOfServiceCompliance: 'Compliant - No scraping or unauthorized reverse engineering',
  recommendedAction:
    'Retain as modular provider stub. Integrate official REST endpoints when TeraBox opens its developer platform.',
  lastAudited: 'November 2026',
};

export class TeraBoxProvider {
  static isSupported(): boolean {
    return false;
  }

  static getQuota(): StorageQuota {
    return {
      provider: 'terabox',
      providerName: 'TeraBox Cloud',
      connected: false,
      usageBytes: 0,
      totalBytes: 1024 * 1024 * 1024 * 1024, // 1 TB theoretical
      lastSynced: undefined,
    };
  }

  static async authenticateAsync(): Promise<never> {
    throw new Error(TERABOX_UNSUPPORTED_MESSAGE);
  }

  static async listFilesAsync(): Promise<CloudFile[]> {
    throw new Error(TERABOX_UNSUPPORTED_MESSAGE);
  }

  static async uploadFileAsync(): Promise<never> {
    throw new Error(TERABOX_UNSUPPORTED_MESSAGE);
  }

  static async downloadFileAsync(): Promise<never> {
    throw new Error(TERABOX_UNSUPPORTED_MESSAGE);
  }
}
