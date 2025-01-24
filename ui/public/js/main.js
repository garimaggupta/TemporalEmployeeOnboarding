// public/js/main.js

// Keep track of current item being assigned
let currentItemId = null;

// Load tasks when the page loads
document.addEventListener('DOMContentLoaded', loadTasks);

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        
        const container = document.getElementById('tasks-container');
        container.innerHTML = tasks.map(task => `
            <div class="item-row">
                <span>${task.workflowID}</span>
                <span>${task.dept}</span>
                <span class="status-${task.status}">${task.status}</span>
                <span>${task.assignee || '-'}</span>
                <span>
                    ${task.status === 'New' 
                        ? `<button class="assign-button" onclick="showAssignModal('${task.workflowID}')">Assign</button>`
                        : 'N/A'
                    }
                </span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}


function showAssignModal(itemId) {
    currentItemId = itemId;
    const modal = document.getElementById('assign-modal');
    const input = document.getElementById('assignee-name');
    modal.style.display = 'block';
    input.value = '';
    input.focus();
}

function closeModal() {
    const modal = document.getElementById('assign-modal');
    modal.style.display = 'none';
    currentItemId = null;
}

async function confirmAssign() {
    const input = document.getElementById('assignee-name');
    const assignee = input.value.trim();
    
    if (!assignee) {
        alert('Please enter assignee name');
        return;
    }
    
    try {
        const response = await fetch(`/api/tasks/${currentItemId}/assign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ assignee }),
        });

        console.log(response)
        
        if (response.ok) {
            closeModal();
             // Show loader before API call
             showLoader();
                
             // Start the minimum loading timer
             const minimumLoadingTimer = ensureMinimumLoadingTime();

              // Wait for both the minimum loading time AND the API response
              await minimumLoadingTimer;
      
             window.location.reload();
             hideLoader();
    
        } else {
            throw new Error('Failed to assign task');
        }
    } catch (error) {
        console.error('Error assigning task:', error);
        alert('Failed to assign task');
    }
}

 // Show loading spinner
 function showLoader() {
    document.getElementById('loaderContainer').style.display = 'flex';
}

// Hide loading spinner
function hideLoader() {
    document.getElementById('loaderContainer').style.display = 'none';
}

 // Function to ensure minimum loading time of 2 seconds
 function ensureMinimumLoadingTime() {
    return new Promise(resolve => setTimeout(resolve, 3000));
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('assign-modal');
    if (event.target === modal) {
        closeModal();
    }
}