# New Employee Onboarding Workflow

## Description

Employee Onboarding Web application that presents onboarding form to New Employees. Once the form is submitted, different sub-tasks assigned to related departments (HR, Payroll and IT) kicks off.

The web application also demos Task assignment portal where in all the subtasks kicked off by Onboarding form submission are resurfaced for assignment. Subtasks resume execution once they are assigned to a team member.

## Features

- **Durable Workflow Execution**: Implemented using Temporal Workflows ensuring reliable and persistent execution of business processes
- **Fanout Pattern**: Efficiently manages multiple parallel subtasks using Temporal Child Workflows
- **Task Assignment**: Leverages Temporal Search Attributes for dynamic task assignment and tracking
- **Enhanced Data Security**: Implements robust data protection using Temporal Data Converter/Codec Server
- **External Integrations**:
  - Pantry API integration for Employee Database Record management
  - SendGrid APIs for automated task assignment and completion notifications
  - Mocky APIs for simulating third-party service interactions

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/garimaggupta/TemporalEmployeeOnboarding.git
   cd TemporalEmployeeOnboarding
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add the following configurations:

   ```env
   # Temporal Configuration
   CERT_PATH=<Cert path if connecting to Temporal Cloud>
   KEY_PATH=<Cert Key path if connecting to Temporal Cloud>
   ADDRESS=<Temporal Cloud URL if connecting to Temporal Cloud>
   NAMESPACE=<Namespace if not using default>

   # Application Configuration
   PORT=3000 # set this to something else to run the UI server on a different port

   # External API Configuration
   PANTRY_API_KEY=<pantry API Key>
   PANTRY_API_URL=<pantry URL>
   SENDGRID_API_KEY=<Sendgrid API key>
   ```

## Running the Application

The application consists of multiple components that need to be running simultaneously:

1. Start the Workers:
   ```bash
   # Start the main worker
   npm run start.watch

   # Start the child worker
   npm run start.watch.child
   ```

2. Start the Development Server:
   ```bash
   npm run dev
   ```

3. Start the Codec Server:
   ```bash
   npm run code-server
   ```

## Architecture

The application implements a workflow-based architecture using Temporal:

1. **Main Workflow**: Handles the overall onboarding process
2. **Child Workflows**: Manage department-specific tasks (HR, Payroll, IT)
3. **Activity Workers**: Execute individual tasks and integrate with external services
4. **Codec Server**: Manages data encryption/decryption for enhanced security

## External Service Integration

- **Pantry API**: Used for employee record management
  - Documentation: https://getpantry.cloud/
- **SendGrid**: Handles email notifications
- **Mocky**: Simulates third-party API interactions
  - Mock API Designer: https://designer.mocky.io/

## Security

The application implements enhanced data security through:
- Temporal Data Converter for secure data serialization
- Codec Server for encryption/decryption of sensitive information
- Secure environment variable management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
