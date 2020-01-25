export class Strategy {
    id: string;
    description: string;
    strategy: string;
    operation: string;
    createdAt: Date;
    updatedAt: Date;
    activated: Map<string, boolean>;
    owner: string;
    config: string;
    values: string[];
}

/*
[
    {
        "values": [
            "10.0.0.3/24"
        ],
        "_id": "5e0803cafcd19802c002eedd",
        "description": "Rollout IP addressess",
        "strategy": "NETWORK_VALIDATION",
        "operation": "EXIST",
        "config": "5e0803bbfcd19802c002eedc",
        "activated": {
            "default": true
        },
        "domain": "5e080381fcd19802c002eed7",
        "owner": "5e080375fcd19802c002eed6",
        "createdAt": "2019-12-28 17:39:22",
        "updatedAt": "2019-12-28 17:39:22",
        "__v": 0,
        "id": "5e0803cafcd19802c002eedd"
    }
]
*/