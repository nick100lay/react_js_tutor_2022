import React, {
    Component,
    useState,
    useEffect,
} from 'react';
import Todo from './components/Todo/Todo';
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
} from 'react-router-dom';
import {
    useUsers,
} from './hooks'


/*
class App extends Component {
  render(){
    return(
      <>
        <Todo />
      </>
    )
  }
} */


let pages = [
    {
        title: 'Список задач',
        path: '/todo',
        element: <Todo />,
        rootRedirect: true,
    }
];

export default function App(props) {

    return (
        <BrowserRouter>
            <Routes>
                <Route exact path='/' element={<Todo />} />} />
            </Routes>
        </BrowserRouter>
    );
}
