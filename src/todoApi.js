

import {
    userExists,
} from './userApi';


const TODOS_URL = 'https://jsonplaceholder.typicode.com/todos';


class TodoError extends Error {
    constructor(msg, code) {
        super(`${msg} (code ${code})`);
        this.name = 'TodoTaskError';
        this.code = code;
    }
}


export const TODO_INVALID_USER = 1;
export const TODO_NO_TITLE = 2;
export const TODO_NO_START_DATE = 3;
export const TODO_NO_COMPLETED = 4;
export const TODO_WRONG_ID = 5


let todos = [];
let todoIds = []


function getFreeId() {
    let id = todoIds.findIndex((task, idx) => idx !== 0 && !task);
    id = id < 0 ? todoIds.length : id;
    id = id === 0 ? 1 : id;
    return id;
}


function checkTodoStartDate(task) {
    if (!(task.startDate instanceof Date)) {
        throw new TodoError('No startDate given', TODO_NO_START_DATE);
    }
}


async function checkTodoUser(task) {
    if (!await userExists(task.userId)) {
        throw new TodoError('User doesn\'t exist', TODO_INVALID_USER);
    }
}


function checkTodoTitle(task) {
    if (typeof task.title !== 'string' || !task.title) {
        throw new TodoError('No title given', TODO_NO_TITLE);
    }
}


function checkTodoCompleted(task) {
    if (typeof task.completed !== 'boolean') {
        throw new TodoError('No completed given', TODO_NO_COMPLETED);
    }
}

function checkTodoId(task) {
    if (todoIds[task.id] !== undefined) {
        throw new TodoError('Id is busy', TODO_WRONG_ID);
    }
}


async function checkTodoToCreate(task) {
    await checkTodoUser(task);
    checkTodoStartDate(task);
    checkTodoTitle(task);
    checkTodoCompleted(task);
    checkTodoId(task);
}


async function createTodoInternal(task, defFields) {
    defFields = defFields === undefined ? {} : defFields;
    let newTask = {...defFields, ...task};
    if (newTask.id === undefined) {
        newTask.id = getFreeId();
    }
    await checkTodoToCreate(newTask);
    todos.push(newTask);
    todoIds[newTask.id] = true;
    return newTask;
}


export async function createTodo(task) {
    return {...await createTodoInternal(task, {
        startDate: new Date(),
        completed: false,
    })};
}


async function checkTodoFieldsToModify(fields) {
    if (fields.startDate !== undefined) {
        checkTodoStartDate(fields);
    }
    if (fields.user !== undefined) {
        await checkTodoUser(fields);
    }
    if (fields.title !== undefined) {
        checkTodoTitle(fields);
    }
    if (fields.completed !== undefined) {
        checkTodoCompleted(fields);
    }
}


export async function modifyTodo(id, fields) {
    if (todoIds[id] === undefined) {
        throw new TodoError('No task with this id', TODO_WRONG_ID);
    }
    await checkTodoFieldsToModify(fields);
    todos = todos.map((task) => (
        task.id === id ? {...task, ...fields, id} : task
    ));
}


async function addTodos(tasks, defFields) {
    let promises = [];
    tasks.forEach((task) => {
        promises.push(createTodoInternal(task, defFields));
    })
    await Promise.all(promises);
}


function fetchTodosFromURL() {
    return fetch(TODOS_URL)
    .then(tasks => tasks.json())
    .then(tasks => addTodos(tasks, {
        startDate: new Date(),
    }))
}


let isFirstFetch = true;
export async function fetchTodos() {
    if (isFirstFetch) {
        await fetchTodosFromURL();
        isFirstFetch = false;
    }
    return todos.map((task) => ({...task}));
}


export async function removeTodo(id) {
    if (todoIds[id] === undefined) {
        throw new TodoError('No task with this id', TODO_WRONG_ID);
    }
    delete todoIds[id];
    todos = todos.filter((task) => task.id !== id);
}
