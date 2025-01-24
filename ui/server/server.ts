
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import { Request, Response } from 'express';
import {queryWorkflowExecutions} from '../../temporal/misc/query_workflows'
import {sendStartSignal} from '../../temporal/misc/signal_workflow'
import {EmployeeOnboardingParentWorkflow} from '../../temporal/workflows/workflows'
import { createClient } from './temporal-client';

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/tasks', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/tasks.html'));
});

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


// Get all tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  queryWorkflowExecutions().then((results) => {
    res.json(results)
    // Expected output: "Success!"
  });
});

// Assign a task
app.post('/api/tasks/:id/assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { assignee } = req.body;


  sendStartSignal(id, assignee).then((result) => {
    console.log(result);
    return res.status(200).json({ result: 'Success' });
  })
  .catch((err) => {
    console.error(err);
     return res.status(404).json({ error: 'Task Assignment Failed' });
  });

});

app.post('/api/submit-form', async(req: Request, res: Response) => {
  

 try {

  const EmployeeFormData =  {
    firstName: req.body.personalInfo.firstName,
    lastName: req.body.personalInfo.lastName,
    address: req.body.personalInfo.address,
    phoneNumber: req.body.personalInfo.phoneNumber,
    email: req.body.personalInfo.email,
    SSN: req.body.personalInfo.ssn,
    bankaccountNumber:req.body.bankingInfo.accountNumber,
    bankroutingNumber:req.body.bankingInfo.routingNumber,
    tshirtSize: req.body.preferences.tshirtSize,
    machineType: req.body.preferences.machinePreference,
    homeOfficeSupplies: req.body.preferences.officeSetup
  }


     const temporalClient = await createClient();
    const handle = await temporalClient.workflow.start(EmployeeOnboardingParentWorkflow, {
      taskQueue: 'Parent_Onboarding-Workflow',
      workflowId: 'EmployeeOnboarding-' + EmployeeFormData.phoneNumber,
        args: [EmployeeFormData]
    });
   
     await temporalClient.connection.close();

    res.json({ 
        success:true,
        workflowId: handle.workflowId,
        message: 'Onboarding Workflow Started' 
    });
} catch (error) {
    console.error('Onboarding Workflow request failed:', error);
    res.status(500).json({ success:false, error: 'Failed to start the Onboarding process. Please contact your administrator' });
}
})


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;