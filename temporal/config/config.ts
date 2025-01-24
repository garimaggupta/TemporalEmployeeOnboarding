
export interface ConfigObj {
    certPath: string,
    keyPath: string,
    certContent: string,
    keyContent: string,
    address: string,
    namespace: string,
    port: string
}

// Interface for child workflow result
export interface ChildWorkflowResult {
    workflowId: string;
    result: string;
}

export enum tshirtSizeList {
    XSMALL = "X-Small",
    SMALL = "Small",
    MEDIUM = "Medium",
    LARGE = "Large",
    XLARGE = "X-Large"
}

export enum machineList {
    PC = 'Windows Laptop',
    MAC = 'MacBook Pro',
    LINUX = 'Linux Laptop'
}

// Interface for Parent Workflow Input Object

export interface EmployeeFormObj {
    firstName: string,
    lastName: string,
    address: string,
    phoneNumber: string,
    email: string,
    SSN: string,
    bankaccountNumber:string,
    bankroutingNumber:string,
    tshirtSize: tshirtSizeList,
    machineType: machineList,
    homeOfficeSupplies: object
}

export interface EmployeeData_HR {
    employeeId:string,
    firstName: string,
    lastName: string,
    address: string,
    phoneNumber: string,
    email: string,
    tshirtSize: tshirtSizeList
}

export interface EmployeeData_Payroll {
    employeeId:string,
    firstName: string,
    lastName: string,
    address: string,
    phoneNumber: string,
    email: string,
    SSN: string,
    bankaccountNumber:string,
    bankroutingNumber:string
}

export interface EmployeeData_IT {
    employeeId:string,
    firstName: string,
    lastName: string,
    address: string,
    phoneNumber: string,
    email: string,
    machineType: machineList,
    homeOfficeSupplies: object
}

export interface PantryRecord {
    id: string;
    data: any;
    createdAt: string;
  }
  
  export interface PantryResponse {
    success: boolean;
    record: PantryRecord;
    error?: string;
  }

  export interface EmailPayload {
    to: string;
    from: string;
    subject: string;
    text: string;
    html: string;
  }
  
  export interface EmailResponse {
    success: boolean;
    messageId?: string;
    error?: string;
  }

// function that returns a ConfigObj with input environment variables
export function getConfig(): ConfigObj {
    return {
        certPath: process.env.CERT_PATH || '',
        keyPath: process.env.KEY_PATH || '',
        certContent: process.env.CERT_CONTENT || '',
        keyContent: process.env.KEY_CONTENT || '',
        address: process.env.ADDRESS || 'localhost:7233',
        namespace: process.env.NAMESPACE || 'default',
        port: process.env.PORT || '3000'
    }
}

// function to print ConfigObj
export function printConfig(config: ConfigObj): void {
    console.log(`ConfigObj: {
        certPath: ${config.certPath},
        keyPath: ${config.keyPath},
        certContent: ${config.certContent},
        keyContent: ${config.keyContent},
        address: ${config.address},
        namespace: ${config.namespace},
        port: ${config.port}
    }`);
}