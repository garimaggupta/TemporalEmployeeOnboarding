
// Sample profiles for prepopulation
const sampleProfiles = {
    profile1: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main Street\nApt 4B\nNew York, NY 10001',
        phoneNumber: '123-456-7890',
        email: 'john.doe@example.com',
        ssn: '123-45-6789',
        accountNumber: '12345678',
        routingNumber: '123456789',
        tshirtSize: 'L',
        machinePreference: 'macbook',
        officeSetup: ['headphones', 'mouse', 'keyboard']
    },
    profile2: {
        firstName: 'Jane',
        lastName: 'Smith',
        address: '456 Park Avenue\nSuite 789\nBoston, MA 02108',
        phoneNumber: '987-654-3210',
        email: 'jane.smith@example.com',
        ssn: '987-65-4321',
        accountNumber: '87654321',
        routingNumber: '987654321',
        tshirtSize: 'M',
        machinePreference: 'windows',
        officeSetup: ['webcam', 'ergonomicChair', 'standingDesk']
    },
    profile3: {
        firstName: 'Robert',
        lastName: 'Johnson',
        address: '789 Tech Lane\nSan Francisco, CA 94105',
        phoneNumber: '555-123-4567',
        email: 'robert.johnson@example.com',
        ssn: '456-78-9012',
        accountNumber: '45678901',
        routingNumber: '456789012',
        tshirtSize: 'XL',
        machinePreference: 'linux',
        officeSetup: ['headphones', 'webcam', 'ergonomicChair']
    }
};

// Function to prepopulate form
function prepopulateForm(profileKey) {
    if (!profileKey) return;

    const profile = sampleProfiles[profileKey];
    const form = document.getElementById('employeeForm');

    // Clear any existing form data and errors
    form.reset();
    clearAllErrors();

    // Populate text inputs, textareas, and selects
    Object.keys(profile).forEach(key => {
        const element = document.getElementById(key);
        if (element && !Array.isArray(profile[key])) {
            element.value = profile[key];
        }
    });

    // Handle checkboxes separately
    if (profile.officeSetup) {
        const checkboxes = form.querySelectorAll('input[name="officeSetup"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = profile.officeSetup.includes(checkbox.value);
        });
    }
}

// Helper function to clear all error messages
function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    document.querySelectorAll('.invalid').forEach(field => field.classList.remove('invalid'));
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('employeeForm');

    // Validation patterns
    const patterns = {
        phone: /^\d{3}-\d{3}-\d{4}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        ssn: /^\d{3}-\d{2}-\d{4}$/,
        routingNumber: /^\d{9}$/,
        accountNumber: /^\d{4,17}$/ // Common length for bank account numbers
    };

    // Format phone number input
    document.getElementById('phoneNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 3) {
            value = value.slice(0,3) + '-' + value.slice(3);
        }
        if (value.length >= 7) {
            value = value.slice(0,7) + '-' + value.slice(7);
        }
        e.target.value = value.slice(0,12);
    });

    // Format SSN input
    document.getElementById('ssn').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 3) {
            value = value.slice(0,3) + '-' + value.slice(3);
        }
        if (value.length >= 6) {
            value = value.slice(0,6) + '-' + value.slice(6);
        }
        e.target.value = value.slice(0,11);
    });

    // Helper function to show error message
    function showError(element, message) {
        removeError(element); // Remove any existing error first
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentElement.appendChild(errorDiv);
        element.classList.add('invalid');
    }

    // Helper function to remove error message
    function removeError(element) {
        const errorDiv = element.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
        element.classList.remove('invalid');
    }

    // Validate individual field
    function validateField(field) {
        let isValid = true;
        const value = field.value.trim();

        // Remove any existing error message first
        removeError(field);

        // Required field validation
        if (field.required && !value) {
            showError(field, `${field.previousElementSibling.textContent.replace(' *', '')} is required`);
            return false;
        }

        // Pattern validation for specific fields
        switch(field.id) {
            case 'phoneNumber':
                if (!patterns.phone.test(value)) {
                    showError(field, 'Please enter a valid phone number (123-456-7890)');
                    isValid = false;
                }
                break;

            case 'email':
                if (!patterns.email.test(value)) {
                    showError(field, 'Please enter a valid email address');
                    isValid = false;
                }
                break;

            case 'ssn':
                if (!patterns.ssn.test(value)) {
                    showError(field, 'Please enter a valid SSN (123-45-6789)');
                    isValid = false;
                }
                break;

            case 'routingNumber':
                if (!patterns.routingNumber.test(value)) {
                    showError(field, 'Please enter a valid 9-digit routing number');
                    isValid = false;
                }
                break;

            case 'accountNumber':
                if (!patterns.accountNumber.test(value)) {
                    showError(field, 'Please enter a valid account number');
                    isValid = false;
                }
                break;

            case 'tshirtSize':
            case 'machinePreference':
                if (!value) {
                    showError(field, `Please select a ${field.id === 'tshirtSize' ? 'T-shirt size' : 'machine preference'}`);
                    isValid = false;
                }
                break;
        }

        return isValid;
    }

    // Add blur event listeners to all form fields for real-time validation
    const formFields = form.querySelectorAll('input:not([type="checkbox"]), select, textarea');
    formFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.classList.contains('invalid')) {
                validateField(field);
            }
        });
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        // Validate all fields
        formFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Collect form data
            const formData = {
                personalInfo: {
                    firstName: form.firstName.value,
                    lastName: form.lastName.value,
                    address: form.address.value,
                    phoneNumber: form.phoneNumber.value,
                    email: form.email.value,
                    ssn: form.ssn.value
                },
                bankingInfo: {
                    accountNumber: form.accountNumber.value,
                    routingNumber: form.routingNumber.value
                },
                preferences: {
                    tshirtSize: form.tshirtSize.value,
                    machinePreference: form.machinePreference.value,
                    officeSetup: Array.from(form.querySelectorAll('input[name="officeSetup"]:checked'))
                        .map(checkbox => checkbox.value)
                }
            };

            // Here you would typically send the data to your server
            console.log('Form data ready to submit:', formData);
            
            // Sending Data to the Server 
            
            fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Success:', data);
                alert('Onboarding Request is submitted successfully!');
                } else {
                    alert(data.error);
                    throw new Error(data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error
            });
            
            form.reset();
        } 
        else {
            // Scroll to the first error
            const firstError = form.querySelector('.error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // Reset form handler
    form.addEventListener('reset', function() {
        // Remove all error messages
        form.querySelectorAll('.error-message').forEach(error => error.remove());
        form.querySelectorAll('.invalid').forEach(field => field.classList.remove('invalid'));
    });
})