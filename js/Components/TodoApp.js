import TodoInput from "./TodoInput.js";
import TodoList from "./TodoList.js";
import { isValidTodoItems, createUniqueId } from "../utils.js";
import TodoCount from "./TodoCount.js";
import TodoFilter from "./Todofilter.js";
import { FilterType } from "../constants.js";
import {
  fetchTodoItmesFromLocalStorage,
  saveTodoItmes2LocalStorage,
} from "../todoLocalStorage.js";

function TodoApp($target) {
  if (!new.target) {
    throw new Error("Create instance with 'new'");
  }

  this.todoItems = fetchTodoItmesFromLocalStorage();
  this.filterType = FilterType.ALL;

  this.setState = (newTodoItems) => {
    if (!isValidTodoItems(newTodoItems)) {
      throw Error("Wrong todoItems");
    }
    this.todoItems = newTodoItems;
    this.init();
  };

  this.addTodo = (contentText) => {
    this.todoItems.push({
      _id: createUniqueId(),
      content: contentText,
      isCompleted: false,
    });
    const filteredTodoItems = this.getFilteredTodoItems();
    this.todoList.setState(filteredTodoItems);
    this.todoCount.setState(filteredTodoItems.length);
    saveTodoItmes2LocalStorage(this.todoItems);
  };

  this.deleteTodoById = (id) => {
    const todoItemIdx = this.todoItems.findIndex(({ _id }) => _id === id);
    if (todoItemIdx === -1) {
      console.log(`Can't find todoItem with id : ${id}`);
      return;
    }
    this.todoItems.splice(todoItemIdx, 1);
    const filteredTodoItems = this.getFilteredTodoItems();
    this.todoList.setState(filteredTodoItems);
    this.todoCount.setState(filteredTodoItems.length);
    saveTodoItmes2LocalStorage(this.todoItems);
  };

  this.deleteAllTodo = () => {
    this.todoItems = [];
    this.todoList.setState(this.todoItems);
    this.todoCount.setState(this.todoItems.length);
    saveTodoItmes2LocalStorage(this.todoItems);
  };

  this.toggleTodoById = (id) => {
    const todoItem = this.todoItems.find(({ _id }) => _id === id);
    if (!todoItem) {
      console.log(`Can't find todoItem with id : ${id}`);
      return;
    }
    todoItem.isCompleted = !todoItem.isCompleted;
    const filteredTodoItems = this.getFilteredTodoItems();
    this.todoList.setState(filteredTodoItems);
    saveTodoItmes2LocalStorage(this.todoItems);
  };

  this.editTodoById = (id, content) => {
    const todoItem = this.todoItems.find(({ _id }) => _id === id);
    if (!todoItem) {
      console.log(`Can't find todoItem with id : ${id}`);
      return;
    }
    if (content !== "") {
      todoItem.content = content;
    }
    const filteredTodoItems = this.getFilteredTodoItems();
    this.todoList.setState(filteredTodoItems);
    saveTodoItmes2LocalStorage(this.todoItems);
  };

  this.setFilterType = (newFilterType) => {
    if (this.filterType === newFilterType) {
      return;
    }
    this.filterType = newFilterType;
    this.todoFilter.setState(this.filterType);
    const filteredTodoItems = this.getFilteredTodoItems();
    this.todoList.setState(filteredTodoItems);
    this.todoCount.setState(filteredTodoItems.length);
  };

  this.getFilteredTodoItems = () => {
    switch (this.filterType) {
      case FilterType.ACTIVE:
        return this.todoItems.filter(({ isCompleted }) => !isCompleted);
      case FilterType.COMPLETED:
        return this.todoItems.filter(({ isCompleted }) => isCompleted);
      default:
        return this.todoItems;
    }
  };

  this.render = () => {
    $target.innerHTML = `
      <section id="todo-input" class="input-container">
      </section>

      <section class="main">
        <div id="todo-list"></div>
      </section>

      <div class="count-container">
        <div id="todo-count"></div>
        <div id="todo-filter"></div>
        <button class="clear-completed">모두 삭제</button>
      </div>
    `;
  };

  this.init = () => {
    this.render();
    this.todoInput = new TodoInput(document.getElementById("todo-input"), {
      onSubmit: (contentText) => this.addTodo(contentText),
    });
    this.todoList = new TodoList(
      document.getElementById("todo-list"),
      this.todoItems,
      {
        deleteTodoById: (id) => this.deleteTodoById(id),
        toggleTodoById: (id) => this.toggleTodoById(id),
        editTodoById: (id, content) => this.editTodoById(id, content),
      }
    );
    this.todoCount = new TodoCount(
      document.getElementById("todo-count"),
      this.todoItems.length
    );
    this.todoFilter = new TodoFilter(
      document.getElementById("todo-filter"),
      this.filterType,
      { onChangeType: (newFilterType) => this.setFilterType(newFilterType) }
    );

    document
      .querySelector(".clear-completed")
      .addEventListener("click", () => this.deleteAllTodo());
  };

  this.init();
}

export default TodoApp;
