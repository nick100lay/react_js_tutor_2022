import { Pagination, Button, Checkbox, List, Col, Input } from 'antd';
import React, {Component } from 'react';

class TodoView extends Component {

    state = {
        curPage: 1,
        perPage: this.props.perPage,
    }

    handelerTodoChecked = (todoID) =>{
        this.props.onTodoChecked(todoID)
    }

    handlerDeleteTodo = (todoID) => {
        this.props.onDeleteTodo(todoID)
    }

    handlePageChange = (page, pageSize) => {
        this.setState({
            curPage: page,
            perPage: pageSize,
        })
    }

    render() {
        const todoList = this.props.todoList
        const perPage = this.state.perPage
        const curPage = this.state.curPage

        const pageList = todoList.slice(
                (curPage - 1)*perPage, curPage*perPage)

        return (
            <>
                <List>
                    {pageList.map((task, idx)=>{
                        return (
                                <List.Item key={idx}
                                        style={{
                                            listStyle: 'decimal',
                                            textDecoration : task.completed ? 'line-through' : 'none'
                                        }}>
                                    <Checkbox
                                            onChange={() => this.handelerTodoChecked(task.id) }
                                            checked={task.completed ? true : false } />

                                    <p>{task.title}</p>

                                    <Button
                                            onClick={()=> this.handlerDeleteTodo(task.id) }>
                                        Удалить
                                    </Button>
                                </List.Item>
                        )
                    })}
                </List>
                <Pagination
                        onChange={(page, pageSize) => this.handlePageChange(page, pageSize)}
                        showSizeChanger={false}
                        defaultCurrent={curPage}
                        defaultPageSize={perPage}
                        total={todoList.length} />
            </>
        )
    }
}

export default class Todo extends Component {

    state = {
        todoList: [],
        todoIds: [],
        perPage : 10,
    }

    copyIds() {
        return this.state.todoIds.map((task) => task)
    }

    addTasks(tasks, defDate) {
        defDate = defDate === undefined ? Date.now() : defDate
        let todoIds = this.copyIds()
        let newTasks = tasks.map((task) => {
            let newTask = {...task}
            newTask.startDate = newTask.startDate === undefined ?
                    defDate : newTask.startDate
            if (newTask.id === undefined) {
                let id = todoIds.findIndex((task, idx) => idx !== 0 && !task)
                id = id < 0 ? todoIds.length : id
                id = id === 0 ? 1 : id
                newTask.id = id
            }
            if (todoIds[newTask.id] !== undefined) {
                throw new Error(`Task with ID ${newTask.id} already exists`)
            }
            newTask.completed = newTask.completed === undefined ? false : newTask.completed
            todoIds[newTask.id] = newTask
            return newTask
        })
        let todoList = [...this.state.todoList, ...newTasks]
        this.setState({todoList, todoIds})
    }

    addTask(task, defDate) {
        this.addTasks([task], defDate)
    }

    deleteTask(id) {
        let todoList = [...this.state.todoList]
        let todoIds = this.copyIds()
        if (todoIds[id] === undefined) {
            throw new Error(`Task with ID ${id} is invalid`)
        }
        todoList = todoList.filter((item) => item.id !== id)
        delete todoIds[id]
        this.setState({todoList, todoIds})
    }

    toggleTask(id) {
        let todoList = [...this.state.todoList]
        let todoIds = this.copyIds()
        if (todoIds[id] === undefined) {
            throw new Error(`Task with ID ${id} is invalid`)
        }
        todoList.every((task, idx) => {
            if (task.id === id) {
                let newTask = {
                    ...task,
                    completed: !task.completed,
                }
                todoList[idx] = newTask
                todoIds[id] = newTask
                return false
            }
            return true
        })
        this.setState({todoList, todoIds})
    }

    componentDidMount(){
        fetch('https://jsonplaceholder.typicode.com/todos')
        .then(res => res.json())
        .then(res => this.addTasks(res))
    }


    handelerTodoChecked = (todoID) =>{
        this.toggleTask(todoID)
    }

    handlerDeleteTodo = (todoID) => {
        this.deleteTask(todoID)
    }

    handlerAddToTodo = (e) => {
        let newTask = {
            title: e.target.value,
        }
        this.addTask(newTask)
    }

    render(){
        const todoList = [...this.state.todoList]
        const perPage = this.state.perPage

        todoList.sort((a, b) => b.startDate - a.startDate)

        return (
            <>
                <Col span={8} style={{margin: '0 auto'}}>
                    <h3>My todo list</h3>
                    <Input placeholder='Добавить todo в список' onPressEnter={(e) => this.handlerAddToTodo(e)} />
                    <TodoView todoList={todoList}
                            perPage={perPage}
                            onTodoChecked={this.handelerTodoChecked}
                            onDeleteTodo={this.handlerDeleteTodo} />
                </Col>
            </>
        )
    }
}
