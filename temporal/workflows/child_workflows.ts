
import { proxyActivities, setHandler, defineSignal, condition, sleep, upsertSearchAttributes } from '@temporalio/workflow';
import type * as activities from '../activities/activities';
import { EmployeeData_HR, EmployeeData_IT, EmployeeData_Payroll, EmailPayload} from '../config/config';


/*** Define signals for each child workflow ***/
export const startHRWFSignal = defineSignal<[string]>('startHRTasks');
export const startPayrollWFSignal = defineSignal<[string]>('startPayrollTasks');
export const startITWFSignal = defineSignal<[string]>('startITTasks');


/*************************************************************************************
 ***************************** HR CHILD WORKFLOW DEFINITION***************************
 *************************************************************************************/

export async function HR_task(input: EmployeeData_HR): Promise<string> {
  const { sendNotification, setupComplianceTraining, setupOrientationAgenda, orderSwag } = proxyActivities<typeof activities>({
      startToCloseTimeout: '1 minute',
  });

  let assignedTo = ''
  let signalReceived = false;
    setHandler(startHRWFSignal, (assignee:string) => {
      assignedTo = assignee
      upsertSearchAttributes({
            assignee: [assignee]
          });
        signalReceived = true;
    });

    // Wait for task to be assigned
    await condition(() => signalReceived);

    upsertSearchAttributes({
        taskstatus: ['Assigned']
      });

      const newTaskAssignedEmail:EmailPayload =  {
        to: 'garima.gupta@temporal.io',   // This should be the email of individual that the task is assigned to
        from: 'garima.gupta@temporal.io',
        subject: 'New Task Assigned',
        text: `Hi ${assignedTo}, You have beed assigned a new task. Please login to task portal for further details. Thank you`,
        html: `Hi ${assignedTo}, <br> You have beed assigned a new task. Please login to task portal for further details. Thank you`
      }

   await sendNotification(newTaskAssignedEmail);

   await setupComplianceTraining({employeeId:input.employeeId, firstName:input.firstName, lastName:input.lastName, emailAddress:input.email});

   await setupOrientationAgenda({employeeId:input.employeeId, firstName:input.firstName, lastName:input.lastName, emailAddress:input.email});

   await orderSwag({employeeId:input.employeeId, firstName:input.firstName, lastName:input.lastName, address:input.address, tshirtSize:input.tshirtSize});


  await sleep('1m')

  upsertSearchAttributes({
    taskstatus: ['Completed']
  });

  return (`All HR Onboarding Tasks Completed`);
}


/*************************************************************************************
 ***************************** PAYROLL CHILD WORKFLOW DEFINITION**********************
 **************************************************************************************/

export async function Payroll_task(input: EmployeeData_Payroll): Promise<string> {
  const { sendNotification, setupTaxDocs, setupDirectDeposit, createPayrollProfile } = proxyActivities<typeof activities>({
      startToCloseTimeout: '1 minute',
  });

   let assignedTo = ''
  let signalReceived = false;
    setHandler(startPayrollWFSignal, (assignee:string) => {
      assignedTo=assignedTo
      upsertSearchAttributes({
        assignee: [assignee]
      });
        signalReceived = true;
    });

    // Wait for signal
    await condition(() => signalReceived);

    upsertSearchAttributes({
        taskstatus: ['Assigned']
      });

      const newTaskAssignedEmail:EmailPayload =  {
        to: 'garima.gupta@temporal.io',
        from: 'garima.gupta@temporal.io',
        subject: 'New Task Assigned',
        text: `Hi ${assignedTo}, You have beed assigned a new task. Please login to task portal for further details. Thank you`,
        html: `Hi ${assignedTo}, <br> You have beed assigned a new task. Please login to task portal for further details. Thank you`
      }

   await sendNotification(newTaskAssignedEmail);

   await createPayrollProfile(input);
  
   await setupDirectDeposit({
                              employeeId:input.employeeId,
                              firstName:input.firstName,
                              lastName:input.lastName,
                              address:input.address,
                              accountNum:input.bankaccountNumber,
                              routingNum:input.bankroutingNumber
                           });

   await setupTaxDocs({
                        employeeId:input.employeeId,
                        firstName:input.firstName,
                        lastName:input.lastName,
                        address:input.address,
                        SSN:input.SSN
   });

  await sleep('1m')

  upsertSearchAttributes({
    taskstatus: ['Completed']
  });

  return (`All Payroll Onboarding Tasks Completed`);
}

/*************************************************************************************
 ***************************** IT CHILD WORKFLOW DEFINITION***************************
 **************************************************************************************/

export async function IT_task(input: EmployeeData_IT): Promise<string> {
  const { sendNotification, createEmailAccount, SSOSetup, OrderEquipment, OrderHomeOfficeSupplies } = proxyActivities<typeof activities>({
      startToCloseTimeout: '1 minute',
  });

  let assignedTo = ''
  let signalReceived = false;

    setHandler(startITWFSignal, (assignee:string) => {
      assignedTo = assignee
      upsertSearchAttributes({
        assignee: [assignee]
      });
        signalReceived = true;
    });

    // Wait for signal
    await condition(() => signalReceived);


    upsertSearchAttributes({
        taskstatus: ['Assigned']
      });

      const newTaskAssignedEmail:EmailPayload =  {
        to: 'garima.gupta@temporal.io',
        from: 'garima.gupta@temporal.io',
        subject: 'New Task Assigned',
        text: `Hi ${assignedTo}, You have beed assigned a new task. Please login to task portal for further details. Thank you`,
        html: `Hi ${assignedTo}, <br> You have beed assigned a new task. Please login to task portal for further details. Thank you`
      }

   await sendNotification(newTaskAssignedEmail);

      
   const email_add = input.firstName+'.'+input.lastName+'@temporal.io'

   await createEmailAccount(email_add);

   await SSOSetup({employeeId:input.employeeId})

   await OrderEquipment({
                          employeeId:input.employeeId,
                          firstName:input.firstName,
                          lastName:input.lastName,
                          address:input.address,
                          machineType:input.machineType
                        })

   await OrderHomeOfficeSupplies({
                                  employeeId:input.employeeId,
                                  firstName:input.firstName,
                                  lastName:input.lastName,
                                  address:input.address,
                                  homeOfficeSuplies:input.homeOfficeSupplies
  })
  
   await sleep('1m')

  upsertSearchAttributes({
    taskstatus: ['Completed']
  });

  return `All IT Onboarding Tasks Completed`;
}
