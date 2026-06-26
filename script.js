class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDate();
        this.render();
        setInterval(() => this.updateDate(), 60000);
    }

    setupEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => this.addTask());
        document.getElementById('task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        document.getElementById('clear-completed').addEventListener('click', () => this.clearCompleted());
        document.getElementById('export-btn').addEventListener('click', () => this.exportTasks());

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
    }

    addTask() {
        const input = document.getElementById('task-input');
        const category = document.getElementById('category-select').value;
        const time = document.getElementById('task-time').value;

        if (input.value.trim() === '') {
            alert('من فضلك أدخل نص المهمة');
            return;
        }

        const task = {
            id: Date.now(),
            text: input.value.trim(),
            category: category,
            time: time || 'بدون وقت',
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        input.value = '';
        document.getElementById('task-time').value = '';
        this.render();
    }

    deleteTask(id) {
        if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    clearCompleted() {
        if (confirm('هل تريد حذف جميع المهام المكتملة؟')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
        }
    }

    exportTasks() {
        const data = this.tasks.map(t => 
            `[${t.completed ? '✓' : ' '}] ${t.text} - ${t.category} (${t.time})`
        ).join('\n');

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        element.setAttribute('download', `مهام_${new Date().toLocaleDateString('ar-SA')}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    getFilteredTasks() {
        if (this.currentFilter === 'all') {
            return this.tasks;
        } else if (this.currentFilter === 'completed') {
            return this.tasks.filter(t => t.completed);
        } else {
            return this.tasks.filter(t => t.category === this.currentFilter);
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('pending-tasks').textContent = pending;
    }

    updateDate() {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateStr = today.toLocaleDateString('ar-SA', options);
        document.getElementById('today-date').textContent = dateStr;
    }

    render() {
        const container = document.getElementById('tasks-container');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-text">لا توجد مهام</div>
                </div>
            `;
        } else {
            container.innerHTML = filteredTasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        class="task-checkbox"
                        ${task.completed ? 'checked' : ''}
                        onchange="taskManager.toggleTask(${task.id})"
                    >
                    <div class="task-content">
                        <div class="task-text">${this.escapeHtml(task.text)}</div>
                        <div class="task-meta">
                            <span class="task-category">${task.category}</span>
                            <span class="task-time">🕐 ${task.time}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-delete" onclick="taskManager.deleteTask(${task.id})">حذف</button>
                    </div>
                </div>
            `).join('');
        }

        this.updateStats();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    }
}

const taskManager = new TaskManager();
