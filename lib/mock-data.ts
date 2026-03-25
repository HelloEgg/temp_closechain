export type ProjectStatus = "active" | "approved" | "archived";
export type DocumentStatus = "not_submitted" | "uploaded" | "approved";

export interface Project {
  id: number;
  name: string;
  jobNumber?: string;
  description?: string;
  clientName?: string;
  address?: string;
  endDate?: string;
  status: ProjectStatus;
  clientPortalToken?: string;
  totalDocuments: number;
  uploadedDocuments: number;
  approvedDocuments: number;
  progress: number;
  createdAt: string;
}

export interface SubcontractorWithProgress {
  id: number;
  vendorName: string;
  vendorCode: string;
  csiCode: string;
  csiDivision: string;
  totalDocuments: number;
  uploadedDocuments: number;
  approvedDocuments: number;
  progress: number;
}

export interface ProjectDetail extends Project {
  subcontractors: SubcontractorWithProgress[];
}

export interface DocumentSlot {
  id: number;
  subcontractorId: number;
  documentType: string;
  parentDocumentType?: string;
  packageSection?: string;
  status: DocumentStatus;
  filePath?: string;
  fileName?: string;
  uploadedAt?: string;
  vendorName: string;
  csiCode: string;
  createdAt: string;
}

export interface CsiDivision {
  code: string;
  name: string;
  requiredDocuments: { documentType: string; parentDocumentType?: string }[];
}

export const CSI_DIVISIONS: CsiDivision[] = [
  {
    code: "030000",
    name: "Concrete",
    requiredDocuments: [
      { documentType: "Mix Design" },
      { documentType: "Concrete Test Reports" },
      { documentType: "Manufacturer Data Sheet", parentDocumentType: "Product Data" },
      { documentType: "Installation Instructions", parentDocumentType: "Product Data" },
      { documentType: "Warranty Certificate" },
    ],
  },
  {
    code: "050000",
    name: "Metals",
    requiredDocuments: [
      { documentType: "Shop Drawings" },
      { documentType: "Mill Certificates" },
      { documentType: "Welder Certifications" },
      { documentType: "Warranty Certificate" },
    ],
  },
  {
    code: "090000",
    name: "Finishes",
    requiredDocuments: [
      { documentType: "Product Data Sheet", parentDocumentType: "Submittals" },
      { documentType: "Color Samples", parentDocumentType: "Submittals" },
      { documentType: "Installation Manual" },
      { documentType: "Maintenance Instructions" },
      { documentType: "Warranty Certificate" },
    ],
  },
  {
    code: "220000",
    name: "Plumbing",
    requiredDocuments: [
      { documentType: "Shop Drawings" },
      { documentType: "As-Built Drawings" },
      { documentType: "O&M Manual" },
      { documentType: "Equipment Schedule", parentDocumentType: "Submittals" },
      { documentType: "Product Data Sheets", parentDocumentType: "Submittals" },
      { documentType: "Test & Balance Report" },
      { documentType: "Warranty Certificate" },
    ],
  },
  {
    code: "230000",
    name: "HVAC",
    requiredDocuments: [
      { documentType: "Shop Drawings" },
      { documentType: "As-Built Drawings" },
      { documentType: "O&M Manual" },
      { documentType: "Balancing Report" },
      { documentType: "Equipment Schedule", parentDocumentType: "Submittals" },
      { documentType: "Controls Sequences" },
      { documentType: "Warranty Certificate" },
    ],
  },
  {
    code: "260000",
    name: "Electrical",
    requiredDocuments: [
      { documentType: "Shop Drawings" },
      { documentType: "As-Built Drawings" },
      { documentType: "Panel Schedules" },
      { documentType: "Electrical Single Line" },
      { documentType: "Test Reports" },
      { documentType: "O&M Manual" },
      { documentType: "Warranty Certificate" },
    ],
  },
  {
    code: "280000",
    name: "Electronic Safety & Security",
    requiredDocuments: [
      { documentType: "Shop Drawings" },
      { documentType: "As-Built Drawings" },
      { documentType: "Programming Manual" },
      { documentType: "O&M Manual" },
      { documentType: "Warranty Certificate" },
    ],
  },
];

export const MOCK_PROJECTS: ProjectDetail[] = [
  {
    id: 1,
    name: "Downtown Office Renovation",
    jobNumber: "JOB-2026-001",
    description: "Full interior renovation of a 12-story downtown office building including MEP upgrades.",
    clientName: "Acme Corp",
    address: "123 Main St, San Francisco, CA",
    endDate: "2026-06-30",
    status: "active",
    totalDocuments: 42,
    uploadedDocuments: 28,
    approvedDocuments: 18,
    progress: 43,
    createdAt: "2026-01-15T10:00:00Z",
    subcontractors: [
      { id: 1, vendorName: "Pacific HVAC Inc.", vendorCode: "PAHVAC", csiCode: "230000", csiDivision: "HVAC", totalDocuments: 7, uploadedDocuments: 5, approvedDocuments: 4, progress: 71 },
      { id: 2, vendorName: "Bay Electrical Co.", vendorCode: "BAYELEC", csiCode: "260000", csiDivision: "Electrical", totalDocuments: 7, uploadedDocuments: 4, approvedDocuments: 2, progress: 43 },
      { id: 3, vendorName: "ProPlumb Solutions", vendorCode: "PPLUMB", csiCode: "220000", csiDivision: "Plumbing", totalDocuments: 7, uploadedDocuments: 3, approvedDocuments: 2, progress: 43 },
      { id: 4, vendorName: "Metro Finishes LLC", vendorCode: "MFIN", csiCode: "090000", csiDivision: "Finishes", totalDocuments: 5, uploadedDocuments: 5, approvedDocuments: 5, progress: 100 },
      { id: 5, vendorName: "SecureTech Systems", vendorCode: "SECTECH", csiCode: "280000", csiDivision: "Electronic Safety & Security", totalDocuments: 5, uploadedDocuments: 3, approvedDocuments: 2, progress: 60 },
      { id: 6, vendorName: "GreenMetal Fabricators", vendorCode: "GMFAB", csiCode: "050000", csiDivision: "Metals", totalDocuments: 4, uploadedDocuments: 4, approvedDocuments: 3, progress: 75 },
    ],
  },
  {
    id: 2,
    name: "Harbor View Condominiums",
    jobNumber: "JOB-2026-002",
    description: "New construction of a 200-unit luxury condominium complex on the waterfront.",
    clientName: "Harbor Development Group",
    address: "500 Harbor Blvd, Oakland, CA",
    endDate: "2026-09-15",
    status: "active",
    totalDocuments: 56,
    uploadedDocuments: 12,
    approvedDocuments: 6,
    progress: 21,
    createdAt: "2026-02-01T10:00:00Z",
    subcontractors: [
      { id: 7, vendorName: "Summit Concrete Inc.", vendorCode: "SUMCON", csiCode: "030000", csiDivision: "Concrete", totalDocuments: 5, uploadedDocuments: 2, approvedDocuments: 1, progress: 40 },
      { id: 8, vendorName: "Bay HVAC Services", vendorCode: "BHVAC", csiCode: "230000", csiDivision: "HVAC", totalDocuments: 7, uploadedDocuments: 3, approvedDocuments: 1, progress: 43 },
      { id: 9, vendorName: "Volt Electric", vendorCode: "VOLTEL", csiCode: "260000", csiDivision: "Electrical", totalDocuments: 7, uploadedDocuments: 4, approvedDocuments: 2, progress: 57 },
      { id: 10, vendorName: "FlowRite Plumbing", vendorCode: "FLRITE", csiCode: "220000", csiDivision: "Plumbing", totalDocuments: 7, uploadedDocuments: 1, approvedDocuments: 1, progress: 14 },
      { id: 11, vendorName: "Steel Frame Co.", vendorCode: "STLFR", csiCode: "050000", csiDivision: "Metals", totalDocuments: 4, uploadedDocuments: 2, approvedDocuments: 1, progress: 50 },
    ],
  },
  {
    id: 3,
    name: "Westside Medical Center Expansion",
    jobNumber: "JOB-2025-009",
    description: "3-story expansion wing including OR suites, imaging rooms, and administrative offices.",
    clientName: "Westside Health System",
    address: "8800 Medical Center Dr, San Jose, CA",
    endDate: "2026-03-01",
    status: "approved",
    clientPortalToken: "demo-token-abc123",
    totalDocuments: 38,
    uploadedDocuments: 38,
    approvedDocuments: 38,
    progress: 100,
    createdAt: "2025-08-10T10:00:00Z",
    subcontractors: [
      { id: 12, vendorName: "MedTech HVAC", vendorCode: "MDHVAC", csiCode: "230000", csiDivision: "HVAC", totalDocuments: 7, uploadedDocuments: 7, approvedDocuments: 7, progress: 100 },
      { id: 13, vendorName: "Precision Electric", vendorCode: "PREELEC", csiCode: "260000", csiDivision: "Electrical", totalDocuments: 7, uploadedDocuments: 7, approvedDocuments: 7, progress: 100 },
      { id: 14, vendorName: "ClearFlow Plumbing", vendorCode: "CLRFLW", csiCode: "220000", csiDivision: "Plumbing", totalDocuments: 7, uploadedDocuments: 7, approvedDocuments: 7, progress: 100 },
    ],
  },
];

export const MOCK_DOCUMENTS: DocumentSlot[] = [
  // Downtown Office Renovation - HVAC (sub 1)
  { id: 1, subcontractorId: 1, documentType: "Shop Drawings", packageSection: "Project Submittals", status: "approved", vendorName: "Pacific HVAC Inc.", csiCode: "230000", filePath: "/objects/doc1.pdf", fileName: "HVAC-Shop-Drawings-v2.pdf", createdAt: "2026-01-20T10:00:00Z" },
  { id: 2, subcontractorId: 1, documentType: "As-Built Drawings", packageSection: "As-Builts", status: "approved", vendorName: "Pacific HVAC Inc.", csiCode: "230000", filePath: "/objects/doc2.pdf", fileName: "HVAC-As-Built.pdf", createdAt: "2026-01-20T10:00:00Z" },
  { id: 3, subcontractorId: 1, documentType: "O&M Manual", packageSection: "Equipment O&Ms", status: "approved", vendorName: "Pacific HVAC Inc.", csiCode: "230000", filePath: "/objects/doc3.pdf", fileName: "HVAC-OM-Manual.pdf", createdAt: "2026-01-20T10:00:00Z" },
  { id: 4, subcontractorId: 1, documentType: "Balancing Report", packageSection: "Balancing Report", status: "approved", vendorName: "Pacific HVAC Inc.", csiCode: "230000", filePath: "/objects/doc4.pdf", fileName: "TAB-Report.pdf", createdAt: "2026-01-20T10:00:00Z" },
  { id: 5, subcontractorId: 1, documentType: "Equipment Schedule", parentDocumentType: "Submittals", packageSection: "Project Submittals", status: "uploaded", vendorName: "Pacific HVAC Inc.", csiCode: "230000", filePath: "/objects/doc5.pdf", fileName: "Equipment-Schedule.pdf", createdAt: "2026-01-20T10:00:00Z" },
  { id: 6, subcontractorId: 1, documentType: "Controls Sequences", packageSection: "Testing/Demonstration", status: "not_submitted", vendorName: "Pacific HVAC Inc.", csiCode: "230000", createdAt: "2026-01-20T10:00:00Z" },
  { id: 7, subcontractorId: 1, documentType: "Warranty Certificate", packageSection: "Warranty", status: "not_submitted", vendorName: "Pacific HVAC Inc.", csiCode: "230000", createdAt: "2026-01-20T10:00:00Z" },
  // Electrical (sub 2)
  { id: 8, subcontractorId: 2, documentType: "Shop Drawings", packageSection: "Project Submittals", status: "approved", vendorName: "Bay Electrical Co.", csiCode: "260000", filePath: "/objects/doc8.pdf", fileName: "Elec-Shop-Drawings.pdf", createdAt: "2026-01-20T10:00:00Z" },
  { id: 9, subcontractorId: 2, documentType: "As-Built Drawings", packageSection: "As-Builts", status: "uploaded", vendorName: "Bay Electrical Co.", csiCode: "260000", filePath: "/objects/doc9.pdf", fileName: "Elec-AsBuilt.pdf", createdAt: "2026-01-20T10:00:00Z" },
  { id: 10, subcontractorId: 2, documentType: "Panel Schedules", packageSection: "Project Submittals", status: "uploaded", vendorName: "Bay Electrical Co.", csiCode: "260000", filePath: "/objects/doc10.pdf", fileName: "Panel-Schedules.pdf", createdAt: "2026-01-20T10:00:00Z" },
  { id: 11, subcontractorId: 2, documentType: "Electrical Single Line", packageSection: "As-Builts", status: "uploaded", vendorName: "Bay Electrical Co.", csiCode: "260000", filePath: "/objects/doc11.pdf", fileName: "Single-Line.pdf", createdAt: "2026-01-20T10:00:00Z" },
  { id: 12, subcontractorId: 2, documentType: "Test Reports", packageSection: "Inspection/Sign Off", status: "not_submitted", vendorName: "Bay Electrical Co.", csiCode: "260000", createdAt: "2026-01-20T10:00:00Z" },
  { id: 13, subcontractorId: 2, documentType: "O&M Manual", packageSection: "Equipment O&Ms", status: "not_submitted", vendorName: "Bay Electrical Co.", csiCode: "260000", createdAt: "2026-01-20T10:00:00Z" },
  { id: 14, subcontractorId: 2, documentType: "Warranty Certificate", packageSection: "Warranty", status: "not_submitted", vendorName: "Bay Electrical Co.", csiCode: "260000", createdAt: "2026-01-20T10:00:00Z" },
];

export const CLIENT_PORTAL_DATA = {
  projectName: "Westside Medical Center Expansion",
  clientName: "Westside Health System",
  description: "3-story expansion wing including OR suites, imaging rooms, and administrative offices.",
  address: "8800 Medical Center Dr, San Jose, CA",
  progress: 100,
  totalDocuments: 21,
  uploadedDocuments: 21,
  approvedDocuments: 21,
  subcontractors: [
    {
      vendorName: "MedTech HVAC",
      csiCode: "230000",
      csiDivision: "HVAC",
      progress: 100,
      documents: [
        { documentType: "Shop Drawings", status: "approved" as DocumentStatus, fileName: "HVAC-Shop-Drawings.pdf", filePath: "/objects/hvac1.pdf" },
        { documentType: "As-Built Drawings", status: "approved" as DocumentStatus, fileName: "HVAC-As-Built.pdf", filePath: "/objects/hvac2.pdf" },
        { documentType: "O&M Manual", status: "approved" as DocumentStatus, fileName: "HVAC-OM-Manual.pdf", filePath: "/objects/hvac3.pdf" },
        { documentType: "Balancing Report", status: "approved" as DocumentStatus, fileName: "TAB-Report.pdf", filePath: "/objects/hvac4.pdf" },
        { documentType: "Equipment Schedule", status: "approved" as DocumentStatus, fileName: "Equipment-Schedule.pdf", filePath: "/objects/hvac5.pdf", parentDocumentType: "Submittals" },
        { documentType: "Controls Sequences", status: "approved" as DocumentStatus, fileName: "Controls-Sequences.pdf", filePath: "/objects/hvac6.pdf" },
        { documentType: "Warranty Certificate", status: "approved" as DocumentStatus, fileName: "Warranty.pdf", filePath: "/objects/hvac7.pdf" },
      ],
    },
    {
      vendorName: "Precision Electric",
      csiCode: "260000",
      csiDivision: "Electrical",
      progress: 100,
      documents: [
        { documentType: "Shop Drawings", status: "approved" as DocumentStatus, fileName: "Elec-Shop-Drawings.pdf", filePath: "/objects/elec1.pdf" },
        { documentType: "As-Built Drawings", status: "approved" as DocumentStatus, fileName: "Elec-As-Built.pdf", filePath: "/objects/elec2.pdf" },
        { documentType: "Panel Schedules", status: "approved" as DocumentStatus, fileName: "Panel-Schedules.pdf", filePath: "/objects/elec3.pdf" },
        { documentType: "Electrical Single Line", status: "approved" as DocumentStatus, fileName: "Single-Line.pdf", filePath: "/objects/elec4.pdf" },
        { documentType: "Test Reports", status: "approved" as DocumentStatus, fileName: "Test-Reports.pdf", filePath: "/objects/elec5.pdf" },
        { documentType: "O&M Manual", status: "approved" as DocumentStatus, fileName: "OM-Manual.pdf", filePath: "/objects/elec6.pdf" },
        { documentType: "Warranty Certificate", status: "approved" as DocumentStatus, fileName: "Warranty.pdf", filePath: "/objects/elec7.pdf" },
      ],
    },
    {
      vendorName: "ClearFlow Plumbing",
      csiCode: "220000",
      csiDivision: "Plumbing",
      progress: 100,
      documents: [
        { documentType: "Shop Drawings", status: "approved" as DocumentStatus, fileName: "Plumb-Shop-Drawings.pdf", filePath: "/objects/plumb1.pdf" },
        { documentType: "As-Built Drawings", status: "approved" as DocumentStatus, fileName: "Plumb-As-Built.pdf", filePath: "/objects/plumb2.pdf" },
        { documentType: "O&M Manual", status: "approved" as DocumentStatus, fileName: "Plumb-OM-Manual.pdf", filePath: "/objects/plumb3.pdf" },
        { documentType: "Equipment Schedule", status: "approved" as DocumentStatus, fileName: "Equipment-Schedule.pdf", filePath: "/objects/plumb4.pdf", parentDocumentType: "Submittals" },
        { documentType: "Product Data Sheets", status: "approved" as DocumentStatus, fileName: "Product-Data.pdf", filePath: "/objects/plumb5.pdf", parentDocumentType: "Submittals" },
        { documentType: "Test & Balance Report", status: "approved" as DocumentStatus, fileName: "Test-Balance.pdf", filePath: "/objects/plumb6.pdf" },
        { documentType: "Warranty Certificate", status: "approved" as DocumentStatus, fileName: "Warranty.pdf", filePath: "/objects/plumb7.pdf" },
      ],
    },
  ],
};
