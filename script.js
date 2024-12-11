document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addButton = document.getElementById('add-button');
    const taskList = document.getElementById('task-list');
    const tasksCounter = document.getElementById('tasks-counter');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categorySelect = document.getElementById('category-select');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const categoryModal = document.getElementById('category-modal');
    const newCategoryInput = document.getElementById('new-category-input');
    const categoryColorPicker = document.getElementById('category-color-picker');
    const saveCategoryBtn = document.getElementById('save-category-btn');
    const cancelCategoryBtn = document.getElementById('cancel-category-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || {
        work: '#3498db',
        personal: '#2ecc71',
        shopping: '#e67e22',
        health: '#9b59b6'
    };

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function saveCategories() {
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    function updateTasksCounter() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksCounter.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const categoryColor = categories[task.category] || '#764ba2';
        const categorySpan = task.category ? 
            `<span class="task-category" style="background-color: ${categoryColor}">${task.category}</span>` : '';

        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            ${categorySpan}
            <span class="task-text">${task.text}</span>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        `;

        const checkbox = li.querySelector('.task-checkbox');
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        return li;
    }

    function addTask(text) {
        if (text.trim()) {
            const newTask = {
                id: Date.now(),
                text: text.trim(),
                completed: false,
                category: categorySelect.value
            };
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            taskInput.value = '';
            categorySelect.value = '';
        }
    }

    function toggleTask(id) {
        tasks = tasks.map(task => 
            task.id === id ? {...task, completed: !task.completed} : task
        );
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }

    function filterTasks(filterType) {
        const taskItems = taskList.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            const task = tasks.find(t => t.id === parseInt(item.dataset.id));
            switch(filterType) {
                case 'active':
                    item.style.display = !task.completed ? 'flex' : 'none';
                    break;
                case 'completed':
                    item.style.display = task.completed ? 'flex' : 'none';
                    break;
                default:
                    item.style.display = 'flex';
            }
        });
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
        updateTasksCounter();
    }

    function updateCategorySelect() {
        const currentValue = categorySelect.value;
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        Object.keys(categories).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        if (currentValue && categories[currentValue]) {
            categorySelect.value = currentValue;
        }
    }

    function showCategoryModal() {
        categoryModal.style.display = 'block';
        newCategoryInput.value = '';
        categoryColorPicker.value = '#764ba2';
    }

    function hideCategoryModal() {
        categoryModal.style.display = 'none';
    }

    function addNewCategory() {
        const categoryName = newCategoryInput.value.trim().toLowerCase();
        if (categoryName && !categories[categoryName]) {
            categories[categoryName] = categoryColorPicker.value;
            saveCategories();
            updateCategorySelect();
            hideCategoryModal();
        }
    }

    // Event Listeners
    addButton.addEventListener('click', () => addTask(taskInput.value));

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTasks(btn.dataset.filter);
        });
    });

    addCategoryBtn.addEventListener('click', showCategoryModal);
    saveCategoryBtn.addEventListener('click', addNewCategory);
    cancelCategoryBtn.addEventListener('click', hideCategoryModal);

    // Close modal when clicking outside
    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            hideCategoryModal();
        }
    });

    // Initialize categories
    updateCategorySelect();

    // Initial render
    renderTasks();
});
