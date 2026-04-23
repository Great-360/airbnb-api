export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
}

const users: User[] = [
    {
        id: 1,
        name: "Fiona smith",
        email: "o7NlN@example.com",     
        password: "password123",
        role: "admin"
    },
    {
        id: 2,
        name: "John Doe",
        email: "bM9bT@example.com",
        password: "password456",
        role: "user"
    },
    {
        id: 3, 
        name: "Jane Doe",
        email: "n6Np9@example.com",
        password: "password789",
        role: "user"
    },
     {
        id: 4,
        name: "Alice Johnson",
        email: "n6Np9@example.com",
        password: "password123",
        role: "user"
     },
     {
        id: 5,
        name: "Bob Smith",
        email: "n6Np9@example.com",
        password: "password456",
        role: "user"
     }

]



export {users};