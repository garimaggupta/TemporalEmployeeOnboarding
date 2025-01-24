import { Client, Connection } from '@temporalio/client';
import { getConfig } from '../config/config';
import { resolve } from 'path';
import { getCertKeyBuffers } from '../config/certificate_helpers';
import { config } from 'dotenv';

const path = resolve(__dirname, '../../.env');
config({path});

const configObj = getConfig();

export async function queryWorkflowExecutions() {
    const { cert, key } = await getCertKeyBuffers(configObj);
    let address = configObj.address
    let namespace = configObj.namespace
    let pageSize:number = 10
  
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

  
  // Create a client
  const client = new Client({
    connection,
    namespace: namespace,
  });


    const query = "ExecutionStatus='Running' AND (WorkflowType = 'HR_task' OR WorkflowType = 'Payroll_task' OR WorkflowType = 'IT_task')"
    const workflowList = []
  // Execute the query
  const result = await client.workflow.list({query,pageSize});
  //console.log(result);

  // Process the results
  for await (const workflow of result) {
    //console.log(workflow)
     
    if (workflow.searchAttributes.assignee! != null) {
    const curr_WF = {workflowID:workflow.workflowId,
                     workflowtype:workflow.type,
                     dept: workflow.searchAttributes.department![0],
                     status:workflow.searchAttributes.taskstatus![0],
                     assignee:workflow.searchAttributes.assignee![0]
     }
     workflowList.push(curr_WF)
   }
    else {
      const curr_WF = {workflowID:workflow.workflowId,
        workflowtype:workflow.type,
        dept: workflow.searchAttributes.department![0],
        status:workflow.searchAttributes.taskstatus![0]
     }
     workflowList.push(curr_WF)
    }

    //workflowList.push(curr_WF)
  }

     return(workflowList)
}

// Call the function
//queryWorkflowExecutions().catch(console.error);