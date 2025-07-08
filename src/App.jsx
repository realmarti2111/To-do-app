import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [dueDateInput, setDueDateInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('todoapp-theme') === 'dark' ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('todoapp-theme'))
  );

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todoapp-tasks-v1');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todoapp-tasks-v1', JSON.stringify(todos));
  }, [todos]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('todoapp-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const addTodo = (e) => {
    e.preventDefault();
    const text = taskInput.trim();
    if (!text) return;

    if (editingId) {
      setTodos(todos.map(todo =>
        todo.id === editingId
          ? { ...todo, text, dueDate: dueDateInput, priority: priorityInput }
          : todo
      ));
      setEditingId(null);
    } else {
      setTodos([{
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        text,
        completed: false,
        dueDate: dueDateInput,
        priority: priorityInput
      }, ...todos]);
    }

    setTaskInput('');
    setDueDateInput('');
    setPriorityInput('');
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setTaskInput(todo.text);
    setDueDateInput(todo.dueDate || '');
    setPriorityInput(todo.priority || '');
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    e.target.classList.add('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === targetId) return;

    const draggedIndex = todos.findIndex(t => t.id === draggedId);
    const targetIndex = todos.findIndex(t => t.id === targetId);
    const newTodos = [...todos];
    const [draggedItem] = newTodos.splice(draggedIndex, 1);
    newTodos.splice(targetIndex, 0, draggedItem);
    setTodos(newTodos);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="container">
      <h1>To-Do List</h1>
      
      <form onSubmit={addTodo} autoComplete="off">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Add a new task..."
          required
          maxLength={120}
        />
        <input
          type="date"
          value={dueDateInput}
          onChange={(e) => setDueDateInput(e.target.value)}
        />
        <select
          value={priorityInput}
          onChange={(e) => setPriorityInput(e.target.value)}
        >
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
      </form>

      <div className="filters">
        <div className="btn-group">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
        <button
          className="toggle-mode"
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle light/dark mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li
            key={todo.id}
            className={`todo-item${todo.completed ? ' completed' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, todo.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, todo.id)}
            onDragEnd={handleDragEnd}
          >
            <input
              type="checkbox"
              className="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo.id)}
            />
            <span className="task-text">{todo.text}</span>
            {todo.dueDate && (
              <span className="due-date">⏰ {todo.dueDate}</span>
            )}
            {todo.priority && (
              <span
                className={`priority ${todo.priority}`}
                title={todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
              />
            )}
            <div className="actions">
              {!todo.completed && (
                <button
                  title="Edit"
                  onClick={() => startEdit(todo)}
                >
                  ✏️
                </button>
              )}
              <button
                title="Delete"
                onClick={() => deleteTodo(todo.id)}
              >
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App; 