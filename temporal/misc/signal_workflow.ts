import { Client, Connection } from '@temporalio/client';
import {startPayrollWFSignal, startHRWFSignal, startITWFSignal} from '../workflows/child_workflows'
import { getCertKeyBuffers } from '../config/certificate_helpers';
import { getConfig } from '../config/config';
import { resolve } from 'path';
import { config } from 'dotenv';

const path = resolve(__dirname, '../../.env');
config({path});

const configObj = getConfig();
//console.log(configObj)

export async function sendStartSignal(workflowid:string, assignee:string) {
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


  const handle = client.workflow.getHandle(workflowid);


  console.log(workflowid.indexOf("HR") !== -1); {}
  console.log(workflowid.indexOf("Payroll") !== -1);
  console.log(workflowid.indexOf("IT") !== -1);

  if (workflowid.indexOf("HR") !== -1) {
    console.log('Sending Signal for HR workflow')
    await handle.signal(startHRWFSignal,assignee);
  }
   else if (workflowid.indexOf("Payroll") !== -1) {
    console.log('Sending Signal for Payroll workflow')
    await handle.signal(startPayrollWFSignal,assignee);
   }
   else if (workflowid.indexOf("IT") !== -1) {
    console.log('Sending Signal for IT workflow')
    await handle.signal(startITWFSignal,assignee);
   }

  return ("Signal sent successfully")
}
