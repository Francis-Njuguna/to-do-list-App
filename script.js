document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.querySelector('.todo-input');
    const addButton = document.querySelector('.add-btn');
    const todoList = document.querySelector('.todo-list');

    // Load tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToList(task));

    // Add task function
    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText) {
            addTaskToList(taskText);
            tasks.push(taskText);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            todoInput.value = '';
        }
    }

    // Add task to list function
    function addTaskToList(text) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${text}</span>
            <button class="delete-btn">❌ Delete</button>
        `;
        todoList.appendChild(li);

        // Add delete functionality
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            const taskIndex = tasks.indexOf(text);
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