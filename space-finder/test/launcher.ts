import { handler } from "../src/services/spaces/handler";

process.env.AWS_REGION = "eu-north-1";
process.env.TABLE_NAME = "SpaceTable-0623bb611d81";

handler({
    httpMethod: "POST",
    //queryStringParameters: {
    //    id: "a84113d1-a5d3-4362-a3d7-900878a16538"
    //},
    headers:{
        'Authorization': 'eyJraWQiOiJtblRhbVg3T3E5d3JBMko0WnJROHI3Y1pvdlNnVDN4NUg1UGJtTEtXZkY4PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxMGJjYzk5Yy04MGExLTcwYTMtYmIxZC1iMjkzYTZkODdmMTgiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbnMiXSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LW5vcnRoLTEuYW1hem9uYXdzLmNvbVwvZXUtbm9ydGgtMV9rYkxWNFlPVHIiLCJjb2duaXRvOnVzZXJuYW1lIjoidXNlciIsIm9yaWdpbl9qdGkiOiJjYTYxZmYwOS0xMzlmLTQ4Y2QtYjljNS04ZDU4YTY3NGZhODMiLCJjb2duaXRvOnJvbGVzIjpbImFybjphd3M6aWFtOjoxMzU4MDg5NjE0MDA6cm9sZVwvQXV0aFN0YWNrLUNvZ25pdG9BZG1pblJvbGU0QzEwRkJBNC1SdUdkbmxNWm4wem0iXSwiYXVkIjoiNW9mbHI3ZjA0aDdkcTUzdjZuN2lkNXM4NHYiLCJldmVudF9pZCI6IjA0M2IwMzg5LWFlMjUtNDNlYy04MjQ1LTBkYWI5OTA1ZDZjNSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzQwODQ5NDg3LCJleHAiOjE3NDA4NTMwODcsImlhdCI6MTc0MDg0OTQ4NywianRpIjoiMTA5YTMwY2EtZTZiMi00NjJkLTk0YTUtMGU1OWI3NTdlMThjIiwiZW1haWwiOiJ1c2VyQGNvbS51YSJ9.NHtvsLgFxvMARiksXd2Wu-Ep4tN4QiIGIyQkBuAJEULWP2XHp7tcmrKD1bmswz5OaxGb4G8W0gITtJUDcPLUz3c0nbtI1l2IjEcVDet6MiPWRkfQPa-P8E2dyLDblVFJZEBTGMQieI6owJx834BfSB3HCpaBelG6QAm_S9QIDYBGtZ1GPQsG282yE_uA9I1wDz-4osvt3MDmc1cA2WLsFpO2Grp9mfTtQp1t1IPYUbaKU0ck2hWF-wA4_a0c8NWUtCycBXKvevilTcMHkO-eQq4djxq9yogTOk66w2hPdPcJrHCnh6QT06hCx4ZHIrdsqmS0Fl64px9kYw04EVWfdQ'
    },
    body: JSON.stringify({
        location: "Dublin updated",
        "name": "Location with new id fuction"
    })
} as any, {} as any)
.then(result => {
    console.log(result);
});