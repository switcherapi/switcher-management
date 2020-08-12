import { Team } from './team';

export class Admin {
    id: string;
    active: boolean;
    name: string;
    email: string;
    teams: Team[] | any;
}

/*
{
    "active": true,
    "teams": [
        "5e10eda73a649463a8ef3751"
    ],
    "_id": "5e0ece2b6f4f994eac9007ad",
    "name": "Roger",
    "email": "mail@mail.com",
    "createdAt": "2020-01-02 21:16:27",
    "updatedAt": "2020-01-19 13:16:27",
    "__v": 1,
    "id": "5e0ece2b6f4f994eac9007ad"
}
*/