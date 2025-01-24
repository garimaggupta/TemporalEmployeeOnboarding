import { Client, Connection } from '@temporalio/client';
import { getCertKeyBuffers } from '../../temporal/config/certificate_helpers';
import { getConfig } from '../../temporal/config/config';
import { getDataConverter } from '../../temporal/dataConverter/data-converter';
import { resolve } from 'path';
import { config } from 'dotenv';

const path = resolve(__dirname, '../../.env');
config({path});

const configObj = getConfig();



   export async function createClient() {

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
        
        const TemporalClient = new Client({
          connection,
          namespace: namespace, // connects to 'default' namespace if not specified
          dataConverter: await getDataConverter()
       });

       return TemporalClient;
    }