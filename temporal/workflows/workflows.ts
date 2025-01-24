
import { proxyActivities, startChild } from '@temporalio/workflow';
import type * as activities from '../activities/activities';
import { ChildWorkflowResult, EmployeeFormObj, EmployeeData_HR, EmployeeData_IT, EmployeeData_Payroll, EmailPayload} from '../config/config';
import { HR_task, Payroll_task, IT_task } from './child_workflows';

/*************************************************************************************
 ***************************** PARENT WORKFLOW DEFINITION*****************************
 *************************************************************************************/

export async function EmployeeOnboardingParentWorkflow(input: EmployeeFormObj): Promise<ChildWorkflowResult[]> {

    const { createEmployeeRecord, sendNotification } = proxyActivities<typeof activities>({
        startToCloseTimeout: '1 minute',
        retry: {
          maximumAttempts: 10,
          initialInterval: '1 second'
        }
      });

      // Create Employee Record and generate Employee ID

      const result = await createEmployeeRecord(input)
      const EmployeeID = result.record.id as string;

      /* Input payloads for Child workflows */

      const HRTaskInput:EmployeeData_HR = {
        employeeId:EmployeeID,
        firstName: input.firstName,
        lastName: input.lastName,
        address: input.address,
        phoneNumber: input.phoneNumber,
        email: input.email,
        tshirtSize: input.tshirtSize
      }

      const PayrollTaskInput: EmployeeData_Payroll = {
        employeeId:EmployeeID,
        firstName: input.firstName,
        lastName: input.lastName,
        address: input.address,
        phoneNumber: input.phoneNumber,
        email: input.email,
        SSN: input.SSN,
        bankaccountNumber:input.bankaccountNumber,
        bankroutingNumber:input.bankroutingNumber
    }

    const ITTaskInput: EmployeeData_IT = {
        employeeId:EmployeeID,
        firstName: input.firstName,
        lastName: input.lastName,
        address: input.address,
        phoneNumber: input.phoneNumber,
        email: input.email,
      machineType: input.machineType,
      homeOfficeSupplies: input.homeOfficeSupplies
  }
  

    const results: ChildWorkflowResult[] = [];

    /* Start all sub-task(child) workflows concurrently */

    const childPromises: Promise<any>[] = [
        startChild(HR_task, {
            args: [HRTaskInput],
            workflowId: 'child-workflow-HR-'+EmployeeID,
            taskQueue: 'child-workflow-queue',
            searchAttributes: {
              department: ['HR'],
              taskstatus: ['New'],
              assignee:['-']
            }
        }),
        startChild(Payroll_task, {
            args: [PayrollTaskInput],
            workflowId: 'child-workflow-Payroll-'+EmployeeID,
            taskQueue: 'child-workflow-queue',
            searchAttributes: {
              department: ['Payroll'],
              taskstatus: ['New'],
              assignee:['-']
            }
        }),
        startChild(IT_task, {
            args: [ITTaskInput],
            workflowId: 'child-workflow-IT-'+EmployeeID,
            taskQueue: 'child-workflow-queue',
            searchAttributes: {
              department: ['IT'],
              taskstatus: ['New'],
              assignee:['-']
            }
        }),
    ];

    // Wait for all child workflows to complete
    const childHandles = await Promise.all(childPromises);

    
    // Collect results from all child workflows
    for (const handle of childHandles) {
        try {
            const result = await handle.result();
            results.push({
                workflowId: handle.workflowId,
                result,
            });
        } catch (error:any) {
            // Handle any errors from child workflows
            results.push({
                workflowId: handle.workflowId,
                result: `Error: ${error.message}`,
            });
        }
    }

    //Send Onboarding Completion email to Employee

     const onboardingCompletionEmail:EmailPayload =  {
        to: input.email,
        from: 'garima.gupta@temporal.io',
        subject: 'Temporal Onboarding Task Completed',
        text: `Hi ${input.firstName}, All of your Temporal Onboarding have been completed. Thank you`,
        html: `Hi ${input.firstName}, <br> All of your Temporal Onboarding have been completed. Thank you`
      }

      await sendNotification(onboardingCompletionEmail);


    return results;
}
