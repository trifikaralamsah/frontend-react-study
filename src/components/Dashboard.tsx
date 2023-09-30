import React, { useEffect, useState } from "react";
import axios from "axios";
import jwt_decode from 'jwt-decode';
import { useNavigate } from "react-router-dom";

interface Users {
    id: number;
    name: string;
    email: string;
}

const Dashboard = () => {
    const [name, setName] = useState('');
    const [token, setToken] = useState('');
    const [expire, setExpire] = useState<number>(0);
    const [users, setUsers] = useState([]);
    const history = useNavigate();

    const refreshToken = async () => {
        try {
            const response = await axios.get('http://localhost:5000/token', {withCredentials: true});
            setToken(response.data.accessToken);
            
            const decoded:any = jwt_decode(response.data.accessToken);
            setName(decoded.name);
            setExpire(decoded.exp);
        } catch (error:any) {
            if (error.response) {
                history('/');
            }
        }
    }
    
    const axiosJWT = axios.create();

    axiosJWT.interceptors.request.use(async (config) => {
        const currentDate = new Date();
        if (expire * 1000 < currentDate.getTime()) {
            const response = await axios.get('http://localhost:5000/token');
            config.headers.Authorization = `Bearer ${response.data.accessToken}}`;
            setToken(response.data.accessToken);

            const decoded:any = jwt_decode(response.data.accessToken);
            setName(decoded.name);
            setExpire(decoded.exp);
        }
        return config;
    }, (error:any) => {
        return Promise.reject(error);
    });

    console.log('exo', expire);
    // const getUsers = async () => {
    //     const response = await axiosJWT.get('http://localhost:5000/users', {
    //         headers: {
    //             Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5hbWUiOiJmaWthciIsImVtYWlsIjoiZmlrZmlrOTQ4QGdtYWlsLmNvbSIsImlhdCI6MTY5NDc0ODQ5MywiZXhwIjoxNjk0NzQ5MDkzfQ.XW9tH0tJPfM36LvVmQux7JJVVFyP8O9DIWmYA5JH0Fc`
    //         }
    //     });
    //     console.log(response.data);
        
    //     setUsers(response.data.data);
    // };

    useEffect(() => {
        if (token === '' || expire === 0) {
            refreshToken();
        }

        if (token !== '') {
            getUsers();
        }
    }, [token])

    
    const getUsers = async () => {
        const response = await axios.get('http://localhost:5000/users', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        
        setUsers(response.data.data);
    };

    // console.log(refreshToken())


    return (
        <div className="container mt-5">
            <h1>Welcome Back: {name}</h1>
            <table className="table is-striped is-fullwidth">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user:Users, index:number) => (
                        <tr key={user.id}>
                            <td>{index + 1}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Dashboard;

