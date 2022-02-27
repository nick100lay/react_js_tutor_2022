

class UserError extends Error {
    constructor(msg, code) {
        super(`${msg} (code ${code})`);
        this.name = 'UserError';
        this.code = code;
    }
}


export const USER_EXISTS = 1;
export const USER_NO_NAME = 2;


let users = [];
let usersIds = [];


function userExistsInternal(userId) {
    return usersIds[userId] !== undefined;
}


export async function userExists(userId) {
    return userExistsInternal(userId);
}


function checkUserToCreate(user) {
    if (userExistsInternal(user.id)) {
        throw new UserError('User already exists', USER_EXISTS);
    }
    if (typeof user.name !== 'string' || !user.name) {
        throw new UserError('User has no name', USER_NO_NAME);
    }
}


function getFreeId() {
    let id = usersIds.findIndex((task, idx) => idx !== 0 && !task);
    id = id < 0 ? usersIds.length : id;
    id = id === 0 ? 1 : id;
    return id;
}


function createUserInternal(user) {
    let newUser = {...user};
    if (newUser.id === undefined) {
        newUser.id = getFreeId();
    }
    checkUserToCreate(newUser);
    users.push(newUser);
    usersIds[newUser.id] = true;
    return newUser;
}
createUserInternal({id: 1, name: 'Гость'});
createUserInternal({id: 2, name: 'Гоша'});
createUserInternal({id: 3, name: 'Петя'});
createUserInternal({id: 4, name: 'Вася'});
createUserInternal({id: 5, name: 'Аноним'});
createUserInternal({id: 6, name: 'Виталий'});
createUserInternal({id: 7, name: 'Алиса'});
createUserInternal({id: 8, name: 'Иван'});
createUserInternal({id: 9, name: 'Даниил'});
createUserInternal({id: 10, name: 'Даня'});
console.log(users);


export async function createUser(user) {
    return {...createUserInternal(user)};
}


export async function fetchUsers() {
    return users.map((user) => ({...user}));
}
