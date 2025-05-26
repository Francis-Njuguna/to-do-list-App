document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.querySelector('.todo-input');
    const reminderTime = document.querySelector('.reminder-time');
    const reminderMinutes = document.querySelector('.reminder-minutes');
    const addButton = document.querySelector('.add-btn');
    const todoList = document.querySelector('.todo-list');
    const notificationBtn = document.querySelector('#notification-permission');

    // Debug function to log notification status
    function logNotificationStatus() {
        console.log('Notification Status:', {
            'Notifications Supported': 'Notification' in window,
            'Permission Status': Notification.permission,
            'Button Visible': !notificationBtn.classList.contains('hidden')
        });
    }

    // Check and handle notification permissions
    function checkNotificationPermission() {
        console.log('Checking notification permission...');
        
        if (!('Notification' in window)) {
            console.error('Notifications not supported in this browser');
            alert('This browser does not support notifications. Please try using Chrome, Firefox, or Edge.');
            return false;
        }

        console.log('Current permission status:', Notification.permission);
        
        if (Notification.permission === 'granted') {
            console.log('Notifications already granted');
            notificationBtn.classList.add('hidden');
            return true;
        } else if (Notification.permission === 'denied') {
            console.log('Notifications denied by user');
            alert('Notifications are blocked. Please enable them in your browser settings and reload the page.');
            return false;
        } else {
            console.log('Permission not yet requested');
            notificationBtn.classList.remove('hidden');
            return false;
        }
    }

    // Request notification permission
    function requestNotificationPermission() {
        console.log('Requesting notification permission...');
        
        if (!('Notification' in window)) {
            alert('This browser does not support notifications. Please try using Chrome, Firefox, or Edge.');
            return;
        }

        Notification.requestPermission()
            .then(permission => {
                console.log('Permission result:', permission);
                
                if (permission === 'granted') {
                    notificationBtn.classList.add('hidden');
                    // Send a test notification
                    try {
                        const notification = new Notification('Notifications Enabled!', {
                            body: 'You will now receive reminders for your tasks.',
                            icon: '🌸',
                            requireInteraction: true // This makes the notification stay until user interacts
                        });
                        
                        notification.onclick = function() {
                            window.focus();
                            this.close();
                        };
                        
                        console.log('Test notification sent successfully');
                    } catch (error) {
                        console.error('Error sending test notification:', error);
                        alert('Error sending test notification. Please check your system settings.');
                    }
                } else {
                    console.log('Permission denied by user');
                    alert('Please enable notifications to receive task reminders');
                }
            })
            .catch(error => {
                console.error('Error requesting permission:', error);
                alert('Error requesting notification permission. Please try again.');
            });
    }

    // Initialize notification permission
    console.log('Initializing notification system...');
    checkNotificationPermission();
    notificationBtn.addEventListener('click', requestNotificationPermission);

    // Load tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToList(task));

    // Add task function
    function addTask() {
        const taskText = todoInput.value.trim();
        const reminderDateTime = reminderTime.value;
        const minutesBefore = parseInt(reminderMinutes.value) || 5;

        console.log('Adding task:', {
            text: taskText,
            reminderTime: reminderDateTime,
            minutesBefore: minutesBefore
        });

        if (taskText) {
            if (reminderDateTime && !checkNotificationPermission()) {
                console.log('Cannot set reminder - notifications not enabled');
                alert('Please enable notifications to set reminders');
                return;
            }

            const task = {
                text: taskText,
                reminderTime: reminderDateTime,
                minutesBefore: minutesBefore
            };
            
            addTaskToList(task);
            tasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            // Set reminder if time is provided
            if (reminderDateTime) {
                setReminder(task);
            }
            
            todoInput.value = '';
            reminderTime.value = '';
        }
    }

    // Set reminder function
    function setReminder(task) {
        console.log('Setting reminder for task:', task);
        
        const reminderTime = new Date(task.reminderTime);
        const reminderMinutes = task.minutesBefore;
        
        // Calculate time for notification
        const notificationTime = new Date(reminderTime.getTime() - (reminderMinutes * 60 * 1000));
        
        console.log('Reminder timing:', {
            dueTime: reminderTime.toLocaleString(),
            notificationTime: notificationTime.toLocaleString(),
            minutesBefore: reminderMinutes
        });
        
        // If the notification time is in the future, set the timeout
        if (notificationTime > new Date()) {
            const timeUntilNotification = notificationTime.getTime() - new Date().getTime();
            console.log('Setting notification for:', Math.round(timeUntilNotification / 1000), 'seconds from now');
            
            setTimeout(() => {
                console.log('Attempting to send notification...');
                if (checkNotificationPermission()) {
                    try {
                        const notification = new Notification('Task Reminder', {
                            body: `Your task "${task.text}" is due in ${reminderMinutes} minutes!`,
                            icon: '🌸',
                            requireInteraction: true
                        });
                        
                        notification.onclick = function() {
                            window.focus();
                            this.close();
                        };
                        
                        console.log('Notification sent successfully');
                    } catch (error) {
                        console.error('Error sending notification:', error);
                    }
                } else {
                    console.log('Cannot send notification - permission not granted');
                }
            }, timeUntilNotification);
        } else {
            console.log('Notification time is in the past, not setting reminder');
        }
    }

    // Add task to list function
    function addTaskToList(task) {
        const li = document.createElement('li');
        const reminderText = task.reminderTime ? 
            ` (Due: ${new Date(task.reminderTime).toLocaleString()})` : '';
            
        li.innerHTML = `
            <span>${task.text}${reminderText}</span>
            <button class="delete-btn">❌ Delete</button>
        `;
        todoList.appendChild(li);

        // Add delete functionality
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            const taskIndex = tasks.findIndex(t => t.text === task.text);
            if (taskIndex > -1) {
                tasks.splice(taskIndex, 1);
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
            li.remove();
        });
    }

    // Event listeners
    addButton.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
});