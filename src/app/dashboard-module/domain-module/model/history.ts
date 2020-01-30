export class History {
  elementId: string;
  oldValue: Map<string, any>;
  newValue: Map<string, any>;
  updatedBy: string;
  date: Date;
}

/*
    {
        "elementId": "5e0ece606f4f994eac9007ae",
        "oldValue": {
            "updatedAt": "2020-01-29 12:12:18"
        },
        "newValue": {
            "updatedAt": "2020-01-29 12:13:15"
        },
        "updatedBy": "mail@mail.com",
        "date": "2020-01-29 12:13:15"
    },
*/