import {
    useState,
    useEffect,
} from 'react';

import {
    fetchUsers,
    createUser,
} from './userApi';

import {
    fetchTodos,
    createTodo,
    removeTodo,
    modifyTodo,
} from './todoApi';


export function useUsers() {
    const [users, setUsers] = useState(null);

    useEffect(() => {
        fetchUsers().then(setUsers);
    }, []);

    const userApi = {
        add: (user) => (
            createUser(user).then(() => {
                fetchUsers().then(setUsers)
            })
        ),
    };

    return [users, userApi];
}


export function useTodos() {
    const [todos, setTodos] = useState(null);

    function update() {
        fetchTodos().then(setTodos);
    }

    useEffect(() => {
        update();
    }, []);

    const todoApi = {
        add: (task) => {
            createTodo(task).then(update);
        },
        remove: (id) => {
            removeTodo(id).then(update);
        },
        modify: (id, task) => {
            modifyTodo(id, task).then(update);
        },
    }

    return [todos, todoApi];
}
