import { Connection, Client } from '@temporalio/client';
import { EmployeeOnboardingParentWorkflow } from '../workflows/workflows';
import { getCertKeyBuffers } from '../config/certificate_helpers';
import { getConfig,EmployeeFormObj, tshirtSizeList, machineList } from '../config/config';
import { resolve } from 'path';
import { config } from 'dotenv';

const path = resolve(__dirname, '../../.env');
config({path});

class WorkflowStartError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'WorkflowStartError';
  }
}

const configObj = getConfig();

export async function startOnboardingWorkflow(EmployeeFormData:EmployeeFormObj) {

  const { cert, key } = await getCertKeyBuffers(configObj);
  let address = configObj.address;
  let namespace = configObj.namespace;

  let connectionOptions = {};

  // if cert and key are null
  if (cert === null && key === null) {
    console.log('No cert and key found in .env file');
    console.log(`Connecting to localhost`);
    connectionOptions = {
      address: `localhost:7233`
    };
  }
  else {
    connectionOptions = {
      address: address,
      tls: {
        clientCertPair: {
          crt: cert,
          key: key,
        },
      },
    };
  }

  const connection = await Connection.connect(connectionOptions);
  
  const client = new Client({
    connection,
     namespace: namespace, // connects to 'default' namespace if not specified
  });

  try {

    const workflowId = await startOnboardingWorkflowImpl(client, EmployeeFormData);

    console.log(`Successfully started workflow with ID: ${workflowId}`);
    return(workflowId);

  } catch (error) {
    if (error instanceof WorkflowStartError) {
      console.error('Workflow start failed:', error.message);
      return(error.message);
  }
}
  

  // Workflow start wrapper with error handling
async function startOnboardingWorkflowImpl(
  client: Client,
  input: EmployeeFormObj
): Promise<string> {
  try {
  
    // Start the workflow with retry logic
    const handle = await client.workflow.start(EmployeeOnboardingParentWorkflow, {
      args: [input],
      taskQueue: 'Parent_Onboarding-Workflow',
      workflowId: 'EmployeeOnboarding-' + input.phoneNumber,
      // Configure workflow options
      retry: {
        maximumAttempts: 3,
        initialInterval: '1 second',
      }
    });

    return handle.workflowId;
  } catch (error) {

    // Handle general errors
    throw new WorkflowStartError(
      `Failed to start workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    );
  }
}
}
/*
  const EmployeeTestData:EmployeeFormObj = {
    firstName: 'Garima',
    lastName: 'Gupta',
    address: 'Bellevue, US',
    phoneNumber: '4252479184',
    email: 'garimaggupta@gmail.com',
    SSN: '656-98-0043',
    bankaccountNumber:'4565656',
    bankroutingNumber:'55445544',
    tshirtSize: tshirtSizeList.MEDIUM,
    machineType: machineList.MAC,
    homeOfficeSupplies: ['Headphone','Monitor']
  }

startOnboardingWorkflow(EmployeeTestData).catch((err) => {
  console.error(err);
  process.exit(1);
});
*/
