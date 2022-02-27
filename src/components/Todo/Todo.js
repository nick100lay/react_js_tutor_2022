import {
    Pagination,
    Button,
    Checkbox,
    List,
    Col,
    Input,
    Dropdown,
    Menu,
} from 'antd';
import {
    useTodos,
    useUsers,
} from '../../hooks';
import React, {
    useState,
    useMemo,
} from 'react';

function TodoView(props) {
    const todoList = props.todoList
    const [pageLimit, setPageLimit] = useState(props.pageLimit);
    const [page, setPage] = useState(props.page);

    const pageList = todoList.slice(
            (page - 1)*pageLimit, page*pageLimit);

    console.log(page);

    return (
        <>
            <List>
                {pageList.map((task, idx)=>{
                    return (
                            <List.Item key={idx}
                                    style={{
                                        listStyle: 'decimal',
                                    }}>
                                <Checkbox
                                        onChange={() => props.onComplete(task.id, task.completed) }
                                        checked={task.completed ? true : false } />
                                <p>
                                    <span>{`${task.userName}: `}</span>
                                    <span
                                            style={{
                                                textDecoration : task.completed ? 'line-through' : 'none'
                                            }}>

                                        {task.title}
                                    </span>
                                </p>
                                <Button
                                        onClick={() => props.onRemove(task.id) }>
                                    Удалить
                                </Button>
                            </List.Item>
                    )
                })}
            </List>
            <Pagination
                    onChange={(page, pageSize) => { setPage(page); setPageLimit(pageSize); }}
                    showSizeChanger={false}
                    defaultCurrent={page}
                    defaultPageSize={pageLimit}
                    total={todoList.length} />
        </>
    )
}


function UserMenu(props) {
    const menuItems = [
        {
            name: '<Все>',
            onClick: () => props.setCurUserId(null)
        },
    ];
    props.users.forEach((user) => {
        menuItems.push({
            name: user.name,
            onClick: () => props.setCurUserId(user.id)
        });
    });

    const menu = (<Menu>
        {menuItems.map((item, idx) => (
            <Menu.Item key={idx}>
                <p onClick={item.onClick}>{item.name}</p>
            </Menu.Item>
        ))}
    </Menu>);

    return (<>
        <Dropdown overlay={menu} arrow>
            <Button>Выбрать пользователя</Button>
        </Dropdown>
    </>);
}


export default function Todo(props) {
    const [todos, todoApi] = useTodos();
    const [users] = useUsers();
    const [curUserId, setCurUserId] = useState(null);

    const todoList = useMemo(() => (
        todos !== null ?
            todos.map((task) => (
                {
                    ...task,
                    userName: users.find((user) => user.id === task.userId).name,
                }
            )).sort((a, b) => b.startDate - a.startDate)
            : null
    ), [todos, users]);


    const todoListFiltered = useMemo(() => (
        todoList !== null ?
            (curUserId === null ?
                todoList :
                todoList.filter((task) => task.userId === curUserId))
            : null
    ), [todoList, curUserId]);

    const pageLimit = 10;

    if (todoListFiltered === null) {
        return (
            <>
                <p>Loading...</p>
            </>
        )
    }

    return (
        <>
            <Col span={8} style={{margin: '0 auto'}}>
                <h3>My todo list</h3>
                <UserMenu
                    users={users}
                    setCurUserId={setCurUserId} />
                <Input placeholder='Добавить todo в список'
                    onPressEnter={(e) => {
                        let title = e.target.value;
                        let userId = 1;
                        todoApi.add({title, userId});
                    }} />
                <TodoView todoList={todoListFiltered}
                        page={1}
                        pageLimit={pageLimit}
                        onComplete={(id, completed) => {
                            completed = !completed;
                            todoApi.modify(id, {completed})
                        }}
                        onRemove={(id) => todoApi.remove(id)} />
            </Col>
        </>
    )
}
