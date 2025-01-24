import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { PantryResponse, EmployeeFormObj, EmailPayload, EmailResponse } from '../config/config';
import { resolve } from 'path';
import { config } from 'dotenv';
const SendGrid = require('@sendgrid/mail')


const path = resolve(__dirname, '../../.env');
config({path});

/*************************************************************************************************************************** */
/**  This activity creates the Employee Record and generates the Employee ID that will be use by subsequent Child workflows **/
/*************************************************************************************************************************** */

export async function createEmployeeRecord(data: EmployeeFormObj): Promise<PantryResponse> {
 
   try {
     const uid = uuidv4(); // Generate unique ID
     const employeeID = uid.replace(/[^0-9]/g, "").substring(1,6);
     const timestamp = new Date().toISOString();

    const PANTRY_API_KEY:string = process.env.PANTRY_API_KEY as string; 
    const PANTRY_API_URL = 'https://getpantry.cloud/apiv1/pantry/' + PANTRY_API_KEY + '/basket/Employeeno-'+PANTRY_API_KEY;
    
     const response = await axios.post(
       PANTRY_API_URL,
       {
         EmployeeID: employeeID,
         data,
         createdAt: timestamp
       },
       {
        headers: {
          'Content-Type': 'application/json'
        }
       }
     );

     return {
       success: true,
       record: {
         id: employeeID,
         data,
         createdAt: timestamp
       }
     };
  } catch (error) {
    return {
      success: false,
      record: { id:'NOT FOUND', data: 'NOT FOUND', createdAt: 'NOT FOUND'},
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/*************************************************************************************************************************** */
/**  This activity sends notfication email upon task completion, assignment etc.                                            **/
/*************************************************************************************************************************** */

export async function sendNotification(emailPayload: EmailPayload): Promise<EmailResponse> {
  const SENDGRID_API_KEY:string = process.env.SENDGRID_API_KEY as string
  
  if (!SENDGRID_API_KEY) {
    throw new Error('SendGrid API key is not configured');
  }

  SendGrid.setApiKey(SENDGRID_API_KEY);

  try {
    const [response] = await SendGrid.send({
      to: emailPayload.to,
      from: emailPayload.from,
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
    });

    return {
      success: true,
      messageId: response.headers['x-message-id']
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('SendGrid error:', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/*************************************************************************************************************************** */
/**  Helper function that calls 3rd party API hosted on https://mocky.io. Configured dummy API endpoint can take in any 
 **  payload and always returns a success. This endpoint can be configured to return different values based on different inputs
/*************************************************************************************************************************** */

async function call3rdPartyAPIs(payload:any): Promise<string> {
  
      const response = await axios.post(
        'https://run.mocky.io/v3/54818c9b-816a-496e-9df8-22d6c6785b58',
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    
      if (response.data.status != 'success') {
        const errorData = response.status
        return(`Request failed: ${errorData}`);
      }
  
      // Format and return response
      return('success')
    }


/*************************************************************************************************************************** */
/**  Order Swag Activity called by HR Child workflow                                                                        **/
/*************************************************************************************************************************** */

export async function orderSwag(swagpayload: any): Promise<string> {

  // Make API call to third-party system
  const res = await call3rdPartyAPIs(swagpayload);

   if (res == 'success') {
    return ('Swag ordered successfully')
   }
   else {
     throw ('Swag ordering failed')
   }
   }

/*************************************************************************************************************************** */
/**  Compliance Training Setup Activity called by HR Child workflow                                                         **/
/*************************************************************************************************************************** */

export async function setupComplianceTraining(compliancePayload: any): Promise<string> {
   // Make API call to third-party system
   const res = await call3rdPartyAPIs(compliancePayload);

   if (res == 'success') {
    return ('Compliance training setup successfully')
   }
   else {
     throw ('Compliance Training setup failed')
   }
}


/*************************************************************************************************************************** */
/**  Orientation Agenda setup Activity called by HR Child workflow                                                          **/
/*************************************************************************************************************************** */

export async function setupOrientationAgenda(orientationAgendaPayload: any): Promise<string> {

  const agendaItems = ['Benefits and Perks Review','Temporal Culture and Values',
                      'Security and Compliance', 'Payroll and Tax Documents', 'Temporal Business and Sales Goals']
  
  let status = true;
                    
  agendaItems.map(async(item) => {
    const result =  await call3rdPartyAPIs({orientationAgendaPayload,item});
    if (result != 'success') {
      status = false
    }
    else {
      console.log(`${item} successfully added to the agenda`)
    }
  })

  if (status)
   return ('Orientation Agenda setup ')
  else
   throw ('Orientation Agenda setup failed')
}


/*************************************************************************************************************************** */
/**  Setup Tax Documents Activity called by Payroll Child workflow                                                          **/
/*************************************************************************************************************************** */

export async function setupTaxDocs(taxInfoPayload: any): Promise<string> {
  // Make API call to third-party system
  const res = await call3rdPartyAPIs(taxInfoPayload);

  if (res == 'success') {
   return ('Tax Documents setup successfully')
  }
  else {
    throw ('Tax document setup failed')
  }
}

/*************************************************************************************************************************** */
/**  Setup Direct Deposit Activity called by Payroll Child workflow                                                         **/
/*************************************************************************************************************************** */

export async function setupDirectDeposit(directDepositInfo: any): Promise<string> {
  // Make API call to third-party system
  const res = await call3rdPartyAPIs(directDepositInfo);

  if (res == 'success') {
   return ('Tax Documents setup successfully')
  }
  else {
    throw ('Tax document setup failed')
  }
}
/*************************************************************************************************************************** */
/**  Create Payroll Profile Activity called by Payroll Child workflow                                                       **/
/*************************************************************************************************************************** */

export async function createPayrollProfile(payrollProfile: any): Promise<string> {
  // Make API call to third-party system
  const res = await call3rdPartyAPIs(payrollProfile);

  if (res == 'success') {
   return ('Tax Documents setup successfully')
  }
  else {
    throw ('Tax document setup failed')
  }
}

/*************************************************************************************************************************** */
/**  Create Email Account Activity called by IT Child workflow                                                              **/
/*************************************************************************************************************************** */

export async function createEmailAccount(email: string): Promise<string> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Simulated async account creation
    await simulateAccountCreation(email);

    return `Email Account -  ${email} created!`;
  } catch (error) {
    console.error('Failed to setup email account:', error);
    throw new Error('Email account creation failed');
  }
 
}

/*************************************************************************************************************************** */
/**  Helper function to simulate email account creation                                                                     **/
/*************************************************************************************************************************** */

async function simulateAccountCreation(email:string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Email account created for ${email}`);
}



/*************************************************************************************************************************** */
/**  SSO Account Setup Activity called by IT Child workflow                                                                 **/
/*************************************************************************************************************************** */

export async function SSOSetup(SSOSetupPayload:any): Promise<string> {
   // Make API call to third-party system
   const res = await call3rdPartyAPIs(SSOSetupPayload);

   if (res == 'success') {
    return ('SSO  setup successfully')
   }
   else {
     throw ('SSO setup failed')
   }
}


/*************************************************************************************************************************** */
/**  Order Equipment Activity called by IT Child workflow                                                                   **/
/*************************************************************************************************************************** */

export async function OrderEquipment(equipmentpayload:any): Promise<string> {

  // Make API call to third-party system
  const res = await call3rdPartyAPIs(equipmentpayload);

  if (res == 'success') {
   return ('Home Office supplies ordered successfully')
  }
  else {
    throw ('Home Office order failed')
  }
}

/*************************************************************************************************************************** */
/**  Order Home Office Supplies Activity called by IT Child workflow                                                        **/
/*************************************************************************************************************************** */

export async function OrderHomeOfficeSupplies(homeofficePayload: any): Promise<string> {

    // Make API call to third-party system
  const res = await call3rdPartyAPIs(homeofficePayload);

  if (res == 'success') {
   return ('Home Office supplies ordered successfully')
  }
  else {
    throw ('Home Office order failed')
  }
}
