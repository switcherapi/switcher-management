export class Domain {
  id: string;
  name: string;
  description: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  activated: Map<string, boolean>;
}

/*
{
  "activated": {
      "default": true
  },
  "_id": "5e080381fcd19802c002eed7",
  "name": "currency-api",
  "description": "Currency API",
  "owner": "5e080375fcd19802c002eed6",
  "createdAt": "2019-12-28 17:38:09",
  "updatedAt": "2019-12-28 17:38:09",
  "__v": 0,
  "id": "5e080381fcd19802c002eed7"
}
*/