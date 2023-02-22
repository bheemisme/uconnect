# uconnect

- it is a AWS serverless project

### AWS services
- AWS Lambda
- AWS DynamoDB
- AWS Cognito
- AWS Amplify
- AWS ApiGatway v2

_this repository dosen't contain entire code it is clone of original repository which is deployed to AWS CodeCommit_


_code is not documented_


### What UCONNECT aims to solve?

Assume a scenario, where there are institutions and users, user wants to query a institution about any issue he has with it, uconnect introduces its way of establishing the communication between two entities

Where a user raises a thread to any institution, it opens a new chat window where he can communicate, once communication is closed, he can terminate the thread, which implies, he can't communicate over the thread any more.


this prototype, implements the above concept to a university where schools are different schools in a university and users can be students or employees

### it a monorepo and it contains 4 repositories
- backend
- school
- user
- worker

### rules
1. schools are institiutions
2. workers are workers to an institution, where a school can offload the threads comming to it to its workers to handler
3. users are the customers
4. two schools can communicate but not two users, and two workers
5. workers don't have much power, they are created and delted by their respective school
6. users are not aware whether the their thread is handled by school itself or its workers.
7. workers are not aware of the owner of the threads they are assigned
8. schools can raise a thread to other school but not to a user or worker
9. user can raise a thread to any school but not to a worker or other user
10. user or school cannot raise more than 5 threads, no school can have more than 5 workers
11. only who raised the thread can be able to terminate or delete the thread


- for chatting, apigateway websocket api is used

1. [school site](https://master.dp4ksuwwexl7j.amplifyapp.com)
2. [user site](https://master.d2kevnxbb0nual.amplifyapp.com )
3. [worker site](https://master.dgow0197axz5x.amplifyapp.com)


![as](./photos/Screenshot%20(43).png)

![as](./photos/Screenshot%20(44).png)

![as](./photos/Screenshot%20(46).png)

![as](./photos/Screenshot%20(54).png)


